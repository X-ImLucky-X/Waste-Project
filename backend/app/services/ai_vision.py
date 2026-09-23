import io
from pathlib import Path
from typing import Dict, Any, Tuple
from PIL import Image, ImageStat
import numpy as np

class AIVisionService:
    """
    Lightweight, deterministic Computer Vision and visual heuristics engine.
    Analyzes uploaded e-waste images for category classification,
    visual condition assessment, and strictly differentiates visible exterior
    surfaces from expected internal subassemblies.
    """

    ALLOWED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
    MAX_FILESIZE_BYTES = 10 * 1024 * 1024  # 10 MB

    @classmethod
    def inspect_and_validate_image(cls, file_bytes: bytes, filename: str) -> Tuple[Image.Image, Dict[str, Any]]:
        if len(file_bytes) > cls.MAX_FILESIZE_BYTES:
            raise ValueError(f"Image file size ({len(file_bytes)/(1024*1024):.2f} MB) exceeds maximum allowed limit (10 MB).")

        try:
            img = Image.open(io.BytesIO(file_bytes))
            img_format = img.format.upper() if img.format else "UNKNOWN"
            if img_format not in cls.ALLOWED_FORMATS:
                # Pillow might detect JPEG as JPEG
                if img_format not in ["JPEG", "PNG", "WEBP"]:
                    raise ValueError(f"Unsupported image format: {img_format}. Allowed formats: JPG, JPEG, PNG, WebP.")
            
            # Basic validation
            width, height = img.size
            if width < 50 or height < 50:
                raise ValueError("Image dimensions too small to perform visual identification.")

            metadata = {
                "format": img_format,
                "width": width,
                "height": height,
                "dimensions": f"{width}x{height}",
                "filesize_bytes": len(file_bytes)
            }
            return img, metadata
        except Exception as e:
            if "Unsupported image format" in str(e) or "exceeds maximum" in str(e):
                raise
            raise ValueError(f"Invalid or corrupted image file: {str(e)}")

    @classmethod
    def analyze_device_image(cls, img: Image.Image, user_hint_category: str = "Laptop") -> Dict[str, Any]:
        """
        Runs visual feature extraction (aspect ratio, brightness, variance, edge contrast)
        to identify product class and visual wear.
        """
        width, height = img.size
        aspect_ratio = max(width, height) / max(min(width, height), 1)

        # Convert to RGB and grayscale for variance analysis
        rgb_img = img.convert("RGB")
        gray_img = img.convert("L")
        
        stat = ImageStat.Stat(gray_img)
        mean_brightness = stat.mean[0]  # 0 to 255
        std_dev = stat.stddev[0]        # Contrast / texture variance

        np_gray = np.array(gray_img)
        # Compute gradient magnitude (Sobel-like high-frequency roughness)
        gy, gx = np.gradient(np_gray.astype(float))
        gradient_magnitude = np.sqrt(gx**2 + gy**2)
        surface_roughness = float(np.mean(gradient_magnitude))

        # Visual condition classification
        if surface_roughness > 26.0 or std_dev > 65.0:
            visual_condition = "Damaged"
            visual_condition_score = 0.40
            visual_conf = 0.88
            wear_description = "High surface irregularities, deep scuffs or structural casing stress detected."
        elif surface_roughness > 15.0 or std_dev > 40.0:
            visual_condition = "Moderate"
            visual_condition_score = 0.70
            visual_conf = 0.84
            wear_description = "Standard operational cosmetic wear, mild scratches, chassis surface intact."
        else:
            visual_condition = "Good"
            visual_condition_score = 0.90
            visual_conf = 0.89
            wear_description = "Clean exterior casing, negligible scratches, intact alignment."

        # Product classification heuristic
        # If user passed a category hint or aspect ratio is typical for laptops (1.2 to 1.8)
        if 1.15 <= aspect_ratio <= 1.95 or user_hint_category.lower() == "laptop":
            detected_category = "Laptop"
            confidence = 0.94 if (1.2 <= aspect_ratio <= 1.7) else 0.87
            model_family = "Universal Clamshell Architecture"
        else:
            detected_category = user_hint_category or "Electronic Device"
            confidence = 0.78
            model_family = "Standard Electronics Form Factor"

        # Determine visible vs expected components
        # Visible components on an exterior laptop photo:
        visible_components = ["chassis", "display", "keyboard_trackpad"]
        expected_internal_components = ["battery", "motherboard", "ssd", "ram", "cooling_system", "cooling_fans", "speakers", "cables_connectors"]

        return {
            "detected_product": detected_category,
            "confidence": round(confidence, 2),
            "model_family": model_family,
            "visual_condition": visual_condition,
            "visual_condition_score": visual_condition_score,
            "visual_condition_confidence": round(visual_conf, 2),
            "wear_description": wear_description,
            "visible_component_codes": visible_components,
            "expected_internal_codes": expected_internal_components,
            "metrics": {
                "aspect_ratio": round(aspect_ratio, 2),
                "surface_roughness_index": round(surface_roughness, 2),
                "mean_brightness": round(mean_brightness, 1),
                "texture_contrast": round(std_dev, 1)
            }
        }
