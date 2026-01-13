
export interface FashionParams {
  camera: string;
  pose: string;
  expression: string;
  fabric: string;
  background: string;
  keepOutfit: boolean;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
}
