import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Set up file upload using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  }
});
const upload = multer({ storage: storage });

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key' // Don't crash if missing immediately, but API calls will fail later
});

// In-memory conversation store mapping conversationId to message history
// In a real app this would be a database.
const conversations = new Map();

// Helper to determine system prompt based on UI if needed, or just default behavior
const systemPrompt = {
    role: "system",
    content: "You are a helpful UI/UX-focused assistant with a rich feature set."
};

// Route: Create Conversation
app.post('/api/conversation/create', (req, res) => {
    const newId = uuidv4();
    conversations.set(newId, [systemPrompt]);
    res.json({ conversationId: newId });
});

// Route: Chat message
app.post('/api/chat', upload.single('file'), async (req, res) => {
    let { conversationId, message } = req.body;
    
    // If no conversation found or provided, create one implicitly
    if (!conversationId || !conversations.has(conversationId)) {
        conversationId = uuidv4();
        conversations.set(conversationId, [systemPrompt]);
    }
    
    const history = conversations.get(conversationId);
    
    // Construct user message
    let content = [];
    if (message) {
        content.push({ type: "text", text: message });
    }
    
    if (req.file) {
        content.push({ type: "text", text: `[User uploaded a file: ${req.file.originalname}, saved at ${req.file.path}]` });
        // NOTE: Actually analyzing the file with OpenAI Vision requires passing image URLs or base64. 
        // For a generic file upload, we just note it was uploaded unless it's an image and we convert it.
    }

    if (content.length === 0) {
        return res.status(400).json({ error: "No message or file provided" });
    }

    // Append user message to history
    history.push({
        role: "user",
        // Format for simple text vs complex text+image array depends on OpenAI model.
        // For standard gpt-3.5 or gpt-4, a simple string is often easier unless it's an image.
        // We'll process `content` array into a string for simplicity if it's text, or use the array.
        content: message ? message + (req.file ? `\n(Also uploaded: ${req.file.originalname})` : '') : `(Uploaded: ${req.file.originalname})`
    });

    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
             // Mock response for testing if no key is provided
             const mockReply = "This is a mock response because the OPENAI_API_KEY is not set in the .env file. " + 
                               "Your message was: " + message;
             history.push({ role: "assistant", content: mockReply });
             return res.json({ 
                 conversationId, 
                 response: mockReply 
             });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: history,
        });

        const reply = completion.choices[0].message.content;
        
        // Append assistant response to history
        history.push({
            role: "assistant",
            content: reply
        });

        res.json({
            conversationId,
            response: reply
        });

    } catch (error) {
        console.error("OpenAI Error:", error);
        // Remove the user's message from history if the request failed to allow retry
        history.pop();
        res.status(500).json({ error: "Failed to communicate with AI model.", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
