
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FashionParams } from "../types";

const API_KEY = process.env.API_KEY || "";

const callGeminiImage = async (
  ai: GoogleGenAI,
  modelImageBase64: string,
  outfitImageBase64: string | null,
  prompt: string
): Promise<string> => {
  const contents: any = {
    parts: [
      {
        inlineData: {
          data: modelImageBase64.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
      ...(outfitImageBase64 ? [{
        inlineData: {
          data: outfitImageBase64.split(",")[1],
          mimeType: "image/jpeg",
        },
      }] : []),
      { text: prompt },
    ],
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: contents,
    config: {
      imageConfig: {
        aspectRatio: "3:4"
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (imagePart?.inlineData?.data) {
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  }

  throw new Error("Failed to generate variant.");
};

export const generateFashionImages = async (
  modelImageBase64: string,
  outfitImageBase64: string | null,
  params: FashionParams
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Constructing the base prompt with ABSOLUTE IDENTITY ANCHORING
  const basePrompt = [
    "SYSTEM ROLE: HIGH-END NEURAL PHOTOGRAPHY STUDIO.",
    "MANDATORY REQUIREMENT: ABSOLUTE IDENTITY CONSISTENCY.",
    "THE PERSON IN THE GENERATED IMAGE MUST BE THE EXACT SAME INDIVIDUAL AS IN THE PROVIDED REFERENCE IMAGE.",
    
    "IDENTITY LOCK PROTOCOL:",
    "1. ZERO HALLUCINATION: Do not generate a new face. Do not modify the existing face. Do not use generic fashion model faces.",
    "2. PIXEL-PERFECT FEATURES: The eye shape, nose structure, lip curve, and unique facial landmarks must be an exact 1:1 match to the source model.",
    "3. FACIAL GEOMETRY: Preserve the skeletal structure of the face (jawline, forehead, cheekbones) precisely.",
    "4. HAIR & SKIN: Maintain the exact hair texture, hairline, skin tone, and natural skin details (moles, freckles) as seen in the reference.",
    "5. NO IDENTITY SWAP: The person must be unmistakably the same human being in every shot.",

    "PROFESSIONAL PHOTOGRAPHY STANDARDS:",
    "1. ANALOG REALISM: The final image must look like it was captured on a Phase One XF medium format camera. No 'AI smoothness', no plastic skin.",
    "2. PHYSICAL LIGHTING: Light must interact with the model's skin and the environment with 100% physical accuracy. Shadows must be soft and naturally cast.",
    "3. FABRIC PHYSICS: Clothing should drape and react to the model's pose and gravity realistically.",

    "SCENE CONFIGURATION:",
    `- ENVIRONMENT: ${params.background || "a neutral, elegant high-end photography studio"}.`,
    `- CAMERA: ${params.camera || "Eye-level full-body editorial framing"}.`,
    `- POSE: ${params.pose || "Natural, professional high-fashion pose"}.`,
    `- EXPRESSION: ${params.expression || "Serene, sophisticated look consistent with identity"}.`,
    `- MATERIAL FIDELITY: ${params.fabric || "Ultra-high resolution fabric textures"}.`,
  ];

  if (params.keepOutfit) {
    basePrompt.push("STRICT OUTFIT RETENTION: Keep the original clothing from the reference image exactly as it is. Only change the pose, lighting, and background.");
  } else if (outfitImageBase64) {
    basePrompt.push("STRICT OUTFIT SWAP: Extract the clothing from the style reference and apply it to the identity reference model. Ensure the identity reference model's face and body remain unchanged.");
  } else {
    basePrompt.push("STYLE SYNTHESIS: Dress the identity reference model in a new high-fashion outfit that perfectly matches her body type and the scene.");
  }

  const fullPrompt = basePrompt.join(" ");

  // Generate 4 variants in parallel to provide a professional contact sheet
  try {
    const results = await Promise.all([
      callGeminiImage(ai, modelImageBase64, outfitImageBase64, fullPrompt + " Shot 1: Master Studio Lighting, focus on identity preservation."),
      callGeminiImage(ai, modelImageBase64, outfitImageBase64, fullPrompt + " Shot 2: Natural Side Lighting, emphasize skin and fabric texture."),
      callGeminiImage(ai, modelImageBase64, outfitImageBase64, fullPrompt + " Shot 3: High-Contrast Editorial, cinematic depth of field."),
      callGeminiImage(ai, modelImageBase64, outfitImageBase64, fullPrompt + " Shot 4: Balanced Commercial Lighting, ultra-clear facial details.")
    ]);
    return results;
  } catch (err: any) {
    throw new Error("Neural rendering failed. Please ensure the identity source image has a clear, unobstructed face.");
  }
};
