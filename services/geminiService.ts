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
 * Generates Arduino C++ code and wiring instructions from a user prompt using the Gemini API.
 * @param prompt - The user's description of the desired logic.
 * @param components - Array of components on the breadboard.
 * @param wires - Array of wires connecting the components.
 * @returns A promise that resolves to an object containing the wiring instructions and the generated code.
 */
export const generateSolutionFromPrompt = async (
    prompt: string, 
    components: ArduinoComponent[], 
    wires: Wire[]
): Promise<{ wiring: string; code: string; }> => {
    try {
        const circuitDescription = describeCircuit(components, wires);
        const componentList = components.map(c => `${c.label} (${c.type})`).join(', ') || 'none';

        const fullPrompt = `
You are an expert Arduino programmer and electronics tutor.
Your task is to provide a complete solution for an Arduino Uno project based on the user's request.

The user has the following components available on their virtual workbench: ${componentList}.
The current wiring on the workbench is as follows: "${circuitDescription}". An empty description means nothing is wired.

Based on this setup, the user's request is: "${prompt}".

Please provide a two-part response:
1.  **Wiring Instructions:** A clear, step-by-step guide on how to wire the necessary components to achieve the user's goal. Base the instructions on the available components. If the user has already wired components, you can acknowledge the existing wiring and provide instructions for any missing or incorrect connections. If the circuit is empty or the wiring is irrelevant to the prompt, provide a complete, step-by-step guide. Be specific about pin numbers (e.g., "Connect the LED's long leg (anode) to digital pin 13.").
2.  **Arduino Code:** A complete, compilable Arduino C++ code snippet for the .ino file that implements the user's logic.

FORMATTING REQUIREMENTS:
- Use the exact markdown headings \`### Wiring Instructions\` and \`### Arduino Code\`.
- For the code, wrap the entire C++ code in a single markdown block like this: \`\`\`cpp ... \`\`\`
- Provide clear and simple language for the wiring instructions, using bullet points or a numbered list.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                temperature: 0.1,
            }
        });

        const text = response.text;
        
        // Extract Wiring Instructions
        const wiringRegex = /### Wiring Instructions\s*([\s\S]*?)(?=### Arduino Code|$)/;
        const wiringMatch = text.match(wiringRegex);
        const wiring = wiringMatch && wiringMatch[1] ? wiringMatch[1].trim() : "Could not generate wiring instructions.";

        // Extract Arduino Code
        const codeRegex = /### Arduino Code\s*```(?:cpp|c\+\+)?\s*([\s\S]*?)\s*```/;
        const codeMatch = text.match(codeRegex);
        let code = codeMatch && codeMatch[1] ? codeMatch[1].trim() : `// Could not generate code. Please check your prompt and circuit.\nvoid setup() {}\nvoid loop() {}`;
        
        // Fallback for code if the main regex fails but a code block exists somewhere
        if (code.startsWith('// Could not generate code')) {
             const fallbackCodeRegex = /```(?:cpp|c\+\+)?\s*([\s\S]*?)\s*```/;
             const fallbackMatch = text.match(fallbackCodeRegex);
             if (fallbackMatch && fallbackMatch[1]) {
                code = fallbackMatch[1].trim();
             }
        }

        return { wiring, code };

    } catch (error) {
        console.error("Error generating Arduino solution:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return {
            wiring: `// Error generating instructions: ${errorMessage}`,
            code: `// Error generating code: ${errorMessage}\nvoid setup() {}\nvoid loop() {}`
        };
    }
};
