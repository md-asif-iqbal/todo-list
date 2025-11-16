import { MongoClient, Db, MongoClientOptions } from 'mongodb';

let uri = process.env.MONGODB_URI || 'mongodb+srv://mdasifkhan2002_db_user:UeTv7Iqj4To0aMQu@cluster0.en1rpdf.mongodb.net/';

if (!uri) {
  throw new Error('Please add your Mongo URI to .env file');
}

// Clean up URI - remove trailing slash if present
uri = uri.trim().replace(/\/$/, '');

// Extract database name (default: todo-app)
const dbName = process.env.MONGODB_DB_NAME || 'todo-app';

// Build connection URI with database name
// Format: mongodb+srv://user:pass@cluster.net/database?options
let connectionUri: string;
if (uri.includes('?')) {
  // URI already has query parameters
  const [base, query] = uri.split('?');
  // Check if database name is in the base URI
  if (base.match(/\/[^\/]+$/)) {
    // Database name already present
    connectionUri = `${base}?${query}`;
  } else {
    // Add database name before query parameters
    connectionUri = `${base}/${dbName}?${query}`;
  }
} else {
  // No query parameters, add database name and options
  connectionUri = `${uri}/${dbName}?retryWrites=true&w=majority`;
}

const options: MongoClientOptions = {
  // Remove explicit TLS options and let MongoDB driver handle it automatically
  // TLS is automatically enabled for mongodb+srv:// connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(connectionUri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error('MongoDB connection error:', error);
      globalWithMongo._mongoClientPromise = undefined;
      throw error;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(connectionUri, options);
  clientPromise = client.connect().catch((error) => {
    console.error('MongoDB connection error:', error);
    throw error;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    
    // Extract database name from connection URI
    // Look for pattern like /database-name?query or /database-name
    const uriPath = connectionUri.split('?')[0]; // Get path part before query params
    const pathParts = uriPath.split('/').filter(Boolean);
    const dbNameMatch = pathParts[pathParts.length - 1]; // Last part should be db name
    
    // If no database name found in path, use default
    const dbName = dbNameMatch && dbNameMatch !== 'cluster0.en1rpdf.mongodb.net' 
      ? dbNameMatch 
      : process.env.MONGODB_DB_NAME || 'todo-app';
    
    console.log('Connecting to database:', dbName);
    return client.db(dbName);
  } catch (error: any) {
    console.error('Error getting database:', error);
    console.error('Connection URI (sanitized):', connectionUri.replace(/:[^:@]+@/, ':****@'));
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

