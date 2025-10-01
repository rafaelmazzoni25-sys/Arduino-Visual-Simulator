import { GoogleGenAI } from "@google/genai";
import { ArduinoComponent, Wire } from "../types";

// Initializes the Google AI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Generates a textual description of the circuit connections.
 * @param components - Array of components on the breadboard.
 * @param wires - Array of wires connecting the components.
 * @returns A string describing the circuit connections.
 */
const describeCircuit = (components: ArduinoComponent[], wires: Wire[]): string => {
    if (wires.length === 0) {
        return "No components are wired.";
    }

    const descriptions = wires.map(wire => {
        const startComp = components.find(c => c.id === wire.start.componentId);
        const endComp = components.find(c => c.id === wire.end.componentId);

        const startDesc = wire.start.componentId === 'arduino' 
            ? `Arduino pin ${wire.start.terminalId.replace('pin-', '')}`
            : `${startComp?.label || 'a component'} terminal ${wire.start.terminalId}`;
        
        const endDesc = wire.end.componentId === 'arduino'
            ? `Arduino pin ${wire.end.terminalId.replace('pin-', '')}`
            : `${endComp?.label || 'a component'} terminal ${wire.end.terminalId}`;

        return `${startDesc} is connected to ${endDesc}.`;
    });

    return descriptions.join(' ');
}


/**
 * Generates Arduino C++ code from a user prompt using the Gemini API.
 * @param prompt - The user's description of the desired logic.
 * @param components - Array of components on the breadboard.
 * @param wires - Array of wires connecting the components.
 * @returns A promise that resolves to the generated Arduino code as a string.
 */
export const generateCodeFromPrompt = async (prompt: string, components: ArduinoComponent[], wires: Wire[]): Promise<string> => {
    try {
        const circuitDescription = describeCircuit(components, wires);
        const componentList = components.map(c => `${c.label} (${c.type})`).join(', ') || 'none';

        const fullPrompt = `
You are an expert Arduino programmer.
Your task is to generate a complete, compilable Arduino C++ code snippet for an Arduino Uno board.
The code should be ready to compile in the Arduino IDE.

The user has the following components available: ${componentList}.
The components are wired as follows: ${circuitDescription}.

Based on this setup, the user's request is: "${prompt}".

IMPORTANT INSTRUCTIONS:
1.  ONLY generate the C++ code for the .ino file.
2.  Wrap the entire code in a single markdown block like this: \`\`\`cpp ... \`\`\`
3.  Do NOT include any explanations, comments about the code, or any text outside of the markdown block.
4.  The code must be complete and self-contained.
5.  Infer pin assignments from the wiring description. For example, if an LED's anode is connected to pin 13, then that LED is on pin 13.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                temperature: 0.1, // Lower temperature for more deterministic code generation
            }
        });

        const text = response.text;
        const codeBlockRegex = /```(?:cpp|c\+\+)?\s*([\s\S]*?)\s*```/;
        const match = text.match(codeBlockRegex);

        if (match && match[1]) {
            return match[1].trim();
        }

        // Fallback if no markdown block is found
        return text.trim();

    } catch (error) {
        console.error("Error generating Arduino code:", error);
        if (error instanceof Error) {
            return `// Error generating code: ${error.message}\nvoid setup() {}\nvoid loop() {}`;
        }
        return `// An unknown error occurred.\nvoid setup() {}\nvoid loop() {}`;
    }
};