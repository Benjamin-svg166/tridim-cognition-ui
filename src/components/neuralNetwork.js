// Neural Network for 3D Chess Position Evaluation using TensorFlow.js
// Lazy-load TensorFlow.js to improve initial page load performance (LCP optimization)
let tf = null;
let tfLoadPromise = null;

const loadTensorFlow = async () => {
  if (tf) return tf;
  if (tfLoadPromise) return tfLoadPromise;
  
  // eslint-disable-next-line import/first
  tfLoadPromise = import('@tensorflow/tfjs').then(module => {
    tf = module;
    return tf;
  });
  
  return tfLoadPromise;
};

// eslint-disable-next-line import/first
import { generateSelfPlayGames } from './selfPlay';

// ==================== BOARD ENCODING ====================

/**
 * Convert board state to neural network input tensor
 * Returns a flat array of features representing the position
 */
export async function encodeBoardState(piecesMap) {
  await loadTensorFlow();
  const features = [];
  
  // For each square (8x8x3 = 192 squares), encode piece information
  // Encoding: [white_pawn, white_knight, white_bishop, white_rook, white_queen, white_king,
  //            black_pawn, black_knight, black_bishop, black_rook, black_queen, black_king]
  // = 12 values per square
  
  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const key = `${x},${y},${z}`;
        const piece = piecesMap.get(key);
        
        // One-hot encoding for each piece type and color
        const pieceEncoding = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        if (piece) {
          const typeIndex = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'].indexOf(piece.type);
          if (typeIndex >= 0) {
            const offset = piece.color === 'white' ? 0 : 6;
            pieceEncoding[offset + typeIndex] = 1;
          }
        }
        
        features.push(...pieceEncoding);
      }
    }
  }
  
  // Add global features (total: 192 * 12 + 2 = 2306 features)
  // Material count
  let whiteMaterial = 0;
  let blackMaterial = 0;
  piecesMap.forEach(piece => {
    const value = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 }[piece.type] || 0;
    if (piece.color === 'white') whiteMaterial += value;
    else blackMaterial += value;
  });
  
  features.push(whiteMaterial / 39); // Normalize
  features.push(blackMaterial / 39); // Normalize
  
  return features;
}

// ==================== NEURAL NETWORK MODEL ====================

/**
 * Create neural network model for position evaluation
 */
export async function createModel() {
  await loadTensorFlow();
  const model = tf.sequential();
  
  // Input layer: 2306 features (192 squares * 12 piece types + 2 material counts)
  const inputSize = 192 * 12 + 2;
  
  // Hidden layers with dropout for regularization (OPTION 2: Increased dropout)
  model.add(tf.layers.dense({
    inputShape: [inputSize],
    units: 512,
    activation: 'relu',
    kernelInitializer: 'heNormal'
  }));
  
  model.add(tf.layers.dropout({ rate: 0.4 })); // Increased from 0.3
  
  model.add(tf.layers.dense({
    units: 256,
    activation: 'relu',
    kernelInitializer: 'heNormal'
  }));
  
  model.add(tf.layers.dropout({ rate: 0.4 })); // Increased from 0.3
  
  model.add(tf.layers.dense({
    units: 128,
    activation: 'relu',
    kernelInitializer: 'heNormal'
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  // Output layer: single value for position evaluation
  // tanh activation: outputs between -1 (black winning) and +1 (white winning)
  model.add(tf.layers.dense({
    units: 1,
    activation: 'tanh'
  }));
  
  // Compile model with Adam optimizer
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });
  
  return model;
}

// ==================== MODEL MANAGEMENT ====================

let globalModel = null;
let isModelLoaded = false;

/**
 * Get or create the global model instance
 */
export async function getModel() {
  await loadTensorFlow();
  if (!globalModel) {
    try {
      // Try to load saved model from IndexedDB
      globalModel = await tf.loadLayersModel('indexeddb://chess3d-nn-model');
      console.log('✅ Neural network model loaded from storage');
      
      // Re-compile loaded model (required after loading)
      globalModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });
      
      isModelLoaded = true;
    } catch (e) {
      // Create new model if none exists
      console.log('🆕 Creating new neural network model...');
      globalModel = await createModel();
      isModelLoaded = false;
    }
  }
  return globalModel;
}

/**
 * Save model to browser storage
 */
export async function saveModel() {
  await loadTensorFlow();
  if (globalModel) {
    await globalModel.save('indexeddb://chess3d-nn-model');
    console.log('💾 Neural network model saved');
  }
}

/**
 * Check if model has been trained
 */
export function isModelTrained() {
  return isModelLoaded;
}

/**
 * Evaluate a position using the neural network
 * Returns a score between -1 (black winning) and +1 (white winning)
 */
export async function evaluatePositionNN(piecesMap, color) {
  const model = await getModel();
  
  // Encode board state
  const features = await encodeBoardState(piecesMap);
  
  // Create tensor and predict
  const inputTensor = tf.tensor2d([features], [1, features.length]);
  const prediction = model.predict(inputTensor);
  const score = (await prediction.data())[0];
  
  // Cleanup tensors
  inputTensor.dispose();
  prediction.dispose();
  
  // Flip score if evaluating for black
  return color === 'white' ? score : -score;
}

// ==================== TRAINING SYSTEM ====================

/**
 * Training data structure
 */
export class TrainingDataCollector {
  constructor() {
    this.trainingData = this.loadFromStorage();
  }
  
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('chess3d_training_data');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load training data from storage:', e);
      return [];
    }
  }
  
  saveToStorage() {
    try {
      const dataStr = JSON.stringify(this.trainingData);
      const sizeKB = Math.round(dataStr.length / 1024);
      
      // Check if data is getting too large (>4MB = likely to fail)
      if (sizeKB > 4096) {
        console.warn(`⚠️ Training data is ${sizeKB}KB - pruning to prevent storage overflow...`);
        // Keep only most recent 2000 positions
        this.trainingData = this.trainingData.slice(-2000);
        return this.saveToStorage(); // Recursive call with pruned data
      }
      
      localStorage.setItem('chess3d_training_data', dataStr);
      console.log(`💾 Saved ${this.trainingData.length} positions (${sizeKB}KB)`);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('❌ Storage quota exceeded! Pruning data...');
        // Emergency pruning - keep only 1000 most recent positions
        this.trainingData = this.trainingData.slice(-1000);
        try {
          localStorage.setItem('chess3d_training_data', JSON.stringify(this.trainingData));
          console.log(`✅ Pruned to ${this.trainingData.length} positions`);
        } catch (e2) {
          console.error('❌ Still failed after pruning. Clearing all training data.');
          this.trainingData = [];
          localStorage.removeItem('chess3d_training_data');
        }
      } else {
        console.error('Failed to save training data:', e);
      }
    }
  }
  
  /**
   * Add game result to training data
   * @param {Array} gamePositions - Array of board states (piecesMap) from the game
   * @param {string} winner - 'white', 'black', or 'draw'
   */
  async addGame(gamePositions, winner) {
    // Convert winner to score: white=1, black=-1, draw=0
    const score = winner === 'white' ? 1.0 : winner === 'black' ? -1.0 : 0.0;
    
    // Add each position from the game with the outcome
    for (const position of gamePositions) {
      const features = await encodeBoardState(position);
      this.trainingData.push({ features, score });
    }
    
    // Keep only last 3,000 positions to manage localStorage quota
    // (3000 positions ≈ 3-4MB, safe for most browsers)
    if (this.trainingData.length > 3000) {
      this.trainingData = this.trainingData.slice(-3000);
      console.log(`🔄 Auto-pruned to ${this.trainingData.length} most recent positions`);
    }
    
    this.saveToStorage();
    console.log(`📊 Training data: ${this.trainingData.length} positions`);
  }
  
  getDataSize() {
    return this.trainingData.length;
  }
  
  /**
   * Train the neural network on collected data
   */
  async trainModel(epochs = 10, batchSize = 32, onProgress = null) {
    await loadTensorFlow();
    if (this.trainingData.length < 100) {
      console.warn('⚠️ Not enough training data (need at least 100 positions)');
      return false;
    }
    
    const model = await getModel();
    
    console.log(`🧠 Training neural network on ${this.trainingData.length} positions...`);
    console.log(`   Epochs: ${epochs}, Batch size: ${batchSize}`);
    
    // Shuffle training data
    const shuffled = [...this.trainingData].sort(() => Math.random() - 0.5);
    
    // Prepare tensors
    const X = shuffled.map(d => d.features);
    const y = shuffled.map(d => d.score);
    
    const inputTensor = tf.tensor2d(X);
    const outputTensor = tf.tensor2d(y, [y.length, 1]);
    
    try {
      // Train model
      await model.fit(inputTensor, outputTensor, {
        epochs,
        batchSize,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`   Epoch ${epoch + 1}/${epochs}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}`);
            if (onProgress) {
              onProgress(epoch + 1, epochs, logs);
            }
          }
        }
      });
      
      // Cleanup tensors
      inputTensor.dispose();
      outputTensor.dispose();
      
      // Save trained model
      await saveModel();
      isModelLoaded = true;
      
      console.log('✅ Training complete! Model saved.');
      return true;
    } catch (e) {
      console.error('❌ Training failed:', e);
      inputTensor.dispose();
      outputTensor.dispose();
      return false;
    }
  }
  
  /**
   * Generate self-play training data
   */
  async generateSelfPlayData(games = 10, onProgress = null) {
    console.log(`🎮 Generating ${games} self-play games for training...`);
    
    try {
      const results = await generateSelfPlayGames(games, {
        difficulty: 'easy', // Changed to 'easy' (depth 1) for 100x faster self-play
        useNN: false, // ALWAYS false for self-play - NN is too slow for bulk generation
        onProgress: (progressData) => {
          if (onProgress) {
            const progress = progressData.gamesCompleted / progressData.totalGames;
            onProgress(progress, `Game ${progressData.gamesCompleted}/${progressData.totalGames}`);
          }
        },
        onGameComplete: (gameNum, total, result) => {
          console.log(`   Game ${gameNum}/${total}: ${result.winner} (${result.moveCount} moves, ${result.reason})`);
        }
      });
      
      console.log(`✅ Self-play complete! Generated ${results.totalPositions} training positions`);
      return results;
      
    } catch (error) {
      console.error('❌ Error during self-play generation:', error);
      throw error;
    }
  }
  
  clear() {
    this.trainingData = [];
    this.saveToStorage();
  }
}

// Global training data collector
export const trainingCollector = new TrainingDataCollector();

// ==================== HYBRID EVALUATION ====================

/**
 * Hybrid evaluation combining traditional evaluation and neural network
 * Uses NN when trained, falls back to traditional eval otherwise
 */
export async function evaluatePositionHybrid(piecesMap, color, traditionalEvalFunc) {
  if (isModelTrained()) {
    try {
      // Use 70% NN evaluation, 30% traditional (for stability)
      const nnScore = await evaluatePositionNN(piecesMap, color);
      const tradScore = traditionalEvalFunc(piecesMap, color);
      
      // NN outputs -1 to 1, scale to match traditional scores
      const scaledNNScore = nnScore * 10000;
      
      return scaledNNScore * 0.7 + tradScore * 0.3;
    } catch (e) {
      console.error('NN evaluation failed, using traditional:', e);
      return traditionalEvalFunc(piecesMap, color);
    }
  } else {
    // Model not trained yet, use traditional evaluation
    return traditionalEvalFunc(piecesMap, color);
  }
}

// ==================== EXPORT STATUS ====================

/**
 * Get neural network status information
 */
export function getNNStatus() {
  return {
    modelLoaded: isModelLoaded,
    trainingDataSize: trainingCollector.getDataSize(),
    isReady: isModelLoaded && trainingCollector.getDataSize() >= 100
  };
}
