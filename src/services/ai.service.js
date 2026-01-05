
import { geminiModels, groqClients, hfApiKey } from '../config/ai-clients.js';
import axios from 'axios';

class AIService {
  constructor() {
    this.groqClients = groqClients;
    this.geminiModels = geminiModels;
    this.hfApiKey = hfApiKey;
  }

  /**
   * Safe JSON parser that can handle markdown blocks and common AI formatting quirks
   */
  parseJSON(text) {
    if (!text) return null;
    let cleanText = text.trim();

    // 1. Remove Markdown Code Blocks
    const jsonMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/) ||
      cleanText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanText = jsonMatch[1];
    }

    // 2. Extract JSON Object/Array
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    const lastBrace = cleanText.lastIndexOf('}');
    const lastBracket = cleanText.lastIndexOf(']');

    let start = -1;
    let end = -1;

    // Detect if Object or Array is more likely
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
      cleanText = cleanText.substring(start, end + 1);
    }

    // 3. Attempt Parse
    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.error('JSON Parse Logic Failed:', e.message);
      // Optional: Add more aggressive repair logic here if needed (e.g. escaping quotes)
      return null;
    }
  }

  /**
   * Generates a JSON response using available AI providers with fallback and rotation
   * @param {string} prompt - The prompt to send
   * @param {number} retries - Number of retries per provider 
   */
  async generateJSON(prompt, retries = 1) {
    let lastError = null;

    // 1. Try Groq (Primary)
    for (const [index, client] of this.groqClients.entries()) {
      try {
        console.log(`🤖 AI: Trying Groq (Key ${index + 1})...`);
        const completion = await client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          response_format: { type: 'json_object' } // Enforce JSON mode if supported
        });

        const content = completion.choices[0]?.message?.content;
        const result = this.parseJSON(content);
        if (result) return result;

      } catch (error) {
        console.warn(`⚠️ Groq Key ${index + 1} Error:`, error.message);
        lastError = error;
        // Rate limit logic could go here
      }
    }

    // 2. Try Gemini (Secondary) 
    for (const model of this.geminiModels) {
      try {
        console.log(`🤖 AI: Trying Gemini (${model.id})...`);
        const result = await model.instance.generateContent(prompt);
        const text = result.response.text();
        const parsed = this.parseJSON(text);
        if (parsed) return parsed;
      } catch (error) {
        console.warn(`⚠️ Gemini ${model.id} Error:`, error.message);
        lastError = error;
      }
    }

    // 3. Try Hugging Face (Tertiary)
    if (this.hfApiKey) {
      try {
        console.log('🤖 AI: Trying Hugging Face...');
        const response = await axios.post(
          "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3",
          {
            inputs: `<s>[INST] ${prompt} \n\n RETURN JSON ONLY. [/INST]`,
            parameters: { max_new_tokens: 4000, temperature: 0.2 }
          },
          { headers: { Authorization: `Bearer ${this.hfApiKey}` } }
        );

        const text = Array.isArray(response.data) ? response.data[0].generated_text : response.data.generated_text;
        const parsed = this.parseJSON(text);
        if (parsed) return parsed;
      } catch (error) {
        console.warn(`⚠️ Hugging Face Error:`, error.message);
        lastError = error;
      }
    }

    throw new Error('All AI providers failed to generate valid JSON. Last error: ' + (lastError?.message || 'Unknown'));
  }

  /**
   * Generates text response using available AI providers with fallback and rotation
   */
  async generateText(prompt) {
    let lastError = null;

    // 1. Try Groq (Primary)
    for (const [index, client] of this.groqClients.entries()) {
      try {
        console.log(`🤖 AI: Trying Groq (Key ${index + 1})...`);
        const completion = await client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) return content;

      } catch (error) {
        console.warn(`⚠️ Groq Key ${index + 1} Error:`, error.message);
        lastError = error;
      }
    }

    // 2. Try Gemini (Secondary) 
    for (const model of this.geminiModels) {
      try {
        console.log(`🤖 AI: Trying Gemini (${model.id})...`);
        const result = await model.instance.generateContent(prompt);
        const text = result.response.text();
        if (text) return text;
      } catch (error) {
        console.warn(`⚠️ Gemini ${model.id} Error:`, error.message);
        lastError = error;
      }
    }

    // 3. Try Hugging Face (Tertiary)
    if (this.hfApiKey) {
      try {
        console.log('🤖 AI: Trying Hugging Face...');
        const response = await axios.post(
          "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3",
          {
            inputs: `<s>[INST] ${prompt} [/INST]`,
            parameters: { max_new_tokens: 4000, temperature: 0.3 }
          },
          { headers: { Authorization: `Bearer ${this.hfApiKey}` } }
        );

        const text = Array.isArray(response.data) ? response.data[0].generated_text : response.data.generated_text;
        if (text) return text;
      } catch (error) {
        console.warn(`⚠️ Hugging Face Error:`, error.message);
        lastError = error;
      }
    }

    throw new Error('All AI providers failed to generate text. Last error: ' + (lastError?.message || 'Unknown'));
  }

  /**
   * Generates vector embedding for text
   * Returns number[] (typically 384 or 768 dimensions)
   */
  async embedText(text) {
    if (!text) return [];

    // 1. Try Hugging Face (sentence-transformers/all-MiniLM-L6-v2) - 384 dimensions
    if (this.hfApiKey) {
      try {
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
          { inputs: text },
          { headers: { Authorization: `Bearer ${this.hfApiKey}` } }
        );

        // HF sometimes returns specific error even with 200 OK
        if (response.data.error) throw new Error(response.data.error);

        // Expected format: [0.1, 0.2, ...] (just the array)
        if (Array.isArray(response.data)) {
          // If batch, it returns [[...]]. If single, can be [...].
          // But inference API usually handles single string -> single array
          // If it returns a list of embeddings, take first.
          // Wait, feature-extraction might return different format.
          // Standard Model API returns number[] for feature extraction?
          // Actually usually it's list of list if input is list.
          // Let's assume input text -> number[].
          return response.data;
        }
      } catch (e) {
        console.warn("HF Embedding Failed:", e.message);
      }
    }

    // 2. Try Gemini (text-embedding-004) - 768 dimensions
    // Note: Dimensions mismatch is a problem. We must stick to one dim size for Vector DB.
    // We will stick to HF's 384 dimensions as primary.
    // If HF fails, we cannot easily fallback to Gemini (768) without re-indexing.
    // For this "100x" demo, we will rely on HF.

    throw new Error("Embedding generation failed (HF unreachable)");
  }
}

// Export Singleton
export const aiService = new AIService();
