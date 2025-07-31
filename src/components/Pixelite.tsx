import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Pixelite.module.css';

interface PixeliteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GridSettings {
  size: number;
  offsetX: number;
  offsetY: number;
  showCoordinates: boolean;
  snapToGrid: boolean;
}

interface OutputSettings {
  size: '16x16' | '32x32' | '64x64' | '64x128' | '128x64' | 'custom';
  customWidth: number;
  customHeight: number;
  previewScale: 1 | 2 | 4;
}

interface ColorPalette {
  colors: string[];
  dominantColors: string[];
}

interface ImageData {
  file: File | null;
  url: string | null;
  width: number;
  height: number;
  name: string;
}

const Pixelite: React.FC<PixeliteProps> = ({ isOpen, onClose }) => {
  const [imageData, setImageData] = useState<ImageData>({
    file: null,
    url: null,
    width: 0,
    height: 0,
    name: ''
  });
  
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    size: 64,
    offsetX: 0,
    offsetY: 0,
    showCoordinates: true,
    snapToGrid: true
  });
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [colorPalette, setColorPalette] = useState<ColorPalette>({
    colors: [],
    dominantColors: []
  });
  const [cellShadingIntensity, setCellShadingIntensity] = useState(0); // 0-100, 0 = no cell shading
  const [livePreview, setLivePreview] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [outputSettings, setOutputSettings] = useState<OutputSettings>({
    size: '64x64',
    customWidth: 64,
    customHeight: 64,
    previewScale: 2
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle file loading
  const handleFileLoad = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageData({
          file,
          url: e.target?.result as string,
          width: img.width,
          height: img.height,
          name: file.name
        });
        
        // Auto-detect grid size based on shorter side being 64px
        const detectedSize = detectOptimalGridSize(img.width, img.height);
        setGridSettings(prev => ({ ...prev, size: detectedSize }));
        
        // Calculate output size to make shorter side 64px
        const aspectRatio = img.width / img.height;
        let outputWidth: number;
        let outputHeight: number;
        
        if (aspectRatio > 1) {
          // Landscape image - height is shorter side
          outputHeight = 64;
          outputWidth = Math.round(64 * aspectRatio);
        } else {
          // Portrait or square image - width is shorter side
          outputWidth = 64;
          outputHeight = Math.round(64 / aspectRatio);
        }
        
        // Ensure minimum size of 16x16
        outputWidth = Math.max(16, outputWidth);
        outputHeight = Math.max(16, outputHeight);
        
        // Set custom output size to maintain aspect ratio with shorter side at 64px
        setOutputSettings(prev => ({
          ...prev,
          size: 'custom',
          customWidth: outputWidth,
          customHeight: outputHeight
        }));
        
        // Extract colors
        extractColors(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Auto-detect optimal grid size based on shorter side being 64px
  const detectOptimalGridSize = (width: number, height: number): number => {
    const shorterSide = Math.min(width, height);
    
    // If shorter side is already 64px or less, use 1px grid
    if (shorterSide <= 64) {
      return 1;
    }
    
    // Calculate grid size to make shorter side 64px
    const gridSize = Math.ceil(shorterSide / 64);
    
    // Ensure grid size is reasonable (between 1 and 64)
    return Math.max(1, Math.min(64, gridSize));
  };

  // Extract dominant colors from image
  const extractColors = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Sample pixels and count colors (skip every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Quantize colors to reduce noise
      const quantizedR = Math.round(r / 32) * 32;
      const quantizedG = Math.round(g / 32) * 32;
      const quantizedB = Math.round(b / 32) * 32;
      const color = `rgb(${quantizedR},${quantizedG},${quantizedB})`;
      
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
    
    // Get top 16 colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([color]) => color);
    
    setColorPalette({
      colors: sortedColors,
      dominantColors: sortedColors.slice(0, 8)
    });
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileLoad(imageFile);
    }
  }, [handleFileLoad]);

  // Handle file input
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileLoad(file);
    }
  }, [handleFileLoad]);

  // Mouse event handlers for pan and zoom
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    // Update mouse position for coordinates
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: Math.floor((e.clientX - rect.left - pan.x) / zoom),
        y: Math.floor((e.clientY - rect.top - pan.y) / zoom)
      });
    }
  }, [isDragging, dragStart, pan, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  // Reset functions
  const resetImage = useCallback(() => {
    setImageData({
      file: null,
      url: null,
      width: 0,
      height: 0,
      name: ''
    });
    setColorPalette({ colors: [], dominantColors: [] });
    setCellShadingIntensity(0);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Calculate effective output size based on grid sampling
  const getOutputSize = useCallback(() => {
    if (!imageData.url) return { width: 0, height: 0 };
    
    let outputWidth: number;
    let outputHeight: number;
    
    // Use selected output size
    switch (outputSettings.size) {
      case '16x16':
        outputWidth = 16;
        outputHeight = 16;
        break;
      case '32x32':
        outputWidth = 32;
        outputHeight = 32;
        break;
      case '64x64':
        outputWidth = 64;
        outputHeight = 64;
        break;
      case '64x128':
        outputWidth = 64;
        outputHeight = 128;
        break;
      case '128x64':
        outputWidth = 128;
        outputHeight = 64;
        break;
      case 'custom':
        outputWidth = outputSettings.customWidth;
        outputHeight = outputSettings.customHeight;
        break;
      default:
        // Calculate output size based on grid sampling
        const { size: gridSize, offsetX, offsetY } = gridSettings;
        const effectiveWidth = imageData.width - offsetX;
        const effectiveHeight = imageData.height - offsetY;
        
        // Each grid cell becomes one pixel in output
        outputWidth = Math.floor(effectiveWidth / gridSize);
        outputHeight = Math.floor(effectiveHeight / gridSize);
    }
    
    return {
      width: outputWidth,
      height: outputHeight
    };
  }, [imageData, gridSettings, outputSettings]);

  // Sample pixels from grid cells to create pixel art
  const sampleGridPixels = useCallback((sourceCanvas: HTMLCanvasElement, outputCanvas: HTMLCanvasElement) => {
    const sourceCtx = sourceCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');
    if (!sourceCtx || !outputCtx) return;
    
    const { size: gridSize, offsetX, offsetY } = gridSettings;
    const outputSize = getOutputSize();
    
    // Get source image data
    const sourceImageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const sourceData = sourceImageData.data;
    
    // Create output image data
    const outputImageData = outputCtx.createImageData(outputSize.width, outputSize.height);
    const outputData = outputImageData.data;
    
    // For each output pixel, sample the corresponding grid cell
    for (let outY = 0; outY < outputSize.height; outY++) {
      for (let outX = 0; outX < outputSize.width; outX++) {
        // Calculate grid cell bounds in source image
        const sourceStartX = offsetX + (outX * gridSize);
        const sourceStartY = offsetY + (outY * gridSize);
        const sourceEndX = sourceStartX + gridSize;
        const sourceEndY = sourceStartY + gridSize;
        
        // Sample all pixels in this grid cell
        let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
        let pixelCount = 0;
        
        for (let sy = sourceStartY; sy < sourceEndY; sy++) {
          for (let sx = sourceStartX; sx < sourceEndX; sx++) {
            if (sx >= 0 && sx < sourceCanvas.width && sy >= 0 && sy < sourceCanvas.height) {
              const sourceIndex = (sy * sourceCanvas.width + sx) * 4;
              totalR += sourceData[sourceIndex];
              totalG += sourceData[sourceIndex + 1];
              totalB += sourceData[sourceIndex + 2];
              totalA += sourceData[sourceIndex + 3];
              pixelCount++;
            }
          }
        }
        
        // Calculate average color for this grid cell
        const avgR = pixelCount > 0 ? Math.round(totalR / pixelCount) : 0;
        const avgG = pixelCount > 0 ? Math.round(totalG / pixelCount) : 0;
        const avgB = pixelCount > 0 ? Math.round(totalB / pixelCount) : 0;
        const avgA = pixelCount > 0 ? Math.round(totalA / pixelCount) : 0;
        
        // Set output pixel
        const outputIndex = (outY * outputSize.width + outX) * 4;
        outputData[outputIndex] = avgR;
        outputData[outputIndex + 1] = avgG;
        outputData[outputIndex + 2] = avgB;
        outputData[outputIndex + 3] = avgA;
      }
    }
    
    // Apply cell shading if enabled
    if (cellShadingIntensity > 0 && colorPalette.dominantColors.length > 0) {
      // Calculate how many colors to use based on intensity
      const maxColors = Math.max(2, Math.floor(16 * (1 - cellShadingIntensity / 100)));
      const colors = colorPalette.dominantColors.slice(0, maxColors);
      
      // Parse colors once for better performance
      const parsedColors = colors.map(color => {
        const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
        return match ? {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        } : null;
      }).filter(Boolean);
      
      if (parsedColors.length > 0) {
        for (let i = 0; i < outputData.length; i += 4) {
          const r = outputData[i];
          const g = outputData[i + 1];
          const b = outputData[i + 2];
          const a = outputData[i + 3];
          
          // Skip transparent pixels
          if (a < 128) continue;
          
          // Find closest color in palette
          let closestColor = parsedColors[0]!;
          let minDistance = Infinity;
          
          for (const color of parsedColors) {
            if (!color) continue;
            
            const distance = Math.sqrt(
              Math.pow(r - color.r, 2) + Math.pow(g - color.g, 2) + Math.pow(b - color.b, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              closestColor = color;
            }
          }
          
          // Apply closest color
          outputData[i] = closestColor.r;
          outputData[i + 1] = closestColor.g;
          outputData[i + 2] = closestColor.b;
        }
      }
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
  }, [gridSettings, getOutputSize, cellShadingIntensity, colorPalette]);

  // Export functions
  const exportPNG = useCallback(() => {
    if (!imageRef.current || !imageData.url) return;
    
    const img = imageRef.current;
    const outputSize = getOutputSize();
    
    // Create a new canvas for the output size
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;
    
    outputCanvas.width = outputSize.width;
    outputCanvas.height = outputSize.height;
    
    // Create a temporary canvas to draw the original image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.drawImage(img, 0, 0);
    
    // Sample grid pixels to create pixel art
    sampleGridPixels(tempCanvas, outputCanvas);
    
    const link = document.createElement('a');
    link.download = `pixelite-${outputSize.width}x${outputSize.height}-${imageData.name.replace(/\.[^/.]+$/, '')}.png`;
    link.href = outputCanvas.toDataURL('image/png');
    link.click();
  }, [imageData, getOutputSize, sampleGridPixels]);

  const copyToClipboard = useCallback(async () => {
    if (!imageRef.current || !imageData.url) return;
    
    try {
      const img = imageRef.current;
      const outputSize = getOutputSize();
      
      // Create a new canvas for the output size
      const outputCanvas = document.createElement('canvas');
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) return;
      
      outputCanvas.width = outputSize.width;
      outputCanvas.height = outputSize.height;
      
      // Create a temporary canvas to draw the original image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      tempCtx.drawImage(img, 0, 0);
      
      // Sample grid pixels to create pixel art
      sampleGridPixels(tempCanvas, outputCanvas);
      
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.write) {
        const blob = await new Promise<Blob>((resolve) => {
          outputCanvas.toBlob((blob) => resolve(blob!));
        });
        
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        // Show success message
        alert('Image copied to clipboard!');
             } else {
         // Fallback: download the image instead
         const link = document.createElement('a');
         link.download = `pixelite-${outputSize.width}x${outputSize.height}-${imageData.name.replace(/\.[^/.]+$/, '')}.png`;
         link.href = outputCanvas.toDataURL('image/png');
         link.click();
         
         alert('Clipboard not supported. Image downloaded instead.');
       }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Fallback: download the image
      try {
        const img = imageRef.current;
        const outputSize = getOutputSize();
        
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d');
        if (!outputCtx) return;
        
        outputCanvas.width = outputSize.width;
        outputCanvas.height = outputSize.height;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempCtx.drawImage(img, 0, 0);
        
        sampleGridPixels(tempCanvas, outputCanvas);
        
                 const link = document.createElement('a');
         link.download = `pixelite-${outputSize.width}x${outputSize.height}-${imageData.name.replace(/\.[^/.]+$/, '')}.png`;
         link.href = outputCanvas.toDataURL('image/png');
         link.click();
        
        alert('Clipboard failed. Image downloaded instead.');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Failed to copy or download image. Please try again.');
      }
    }
  }, [imageData, getOutputSize, sampleGridPixels]);

  // Helper functions for slider buttons
  const adjustGridSize = useCallback((delta: number) => {
    setGridSettings(prev => ({
      ...prev,
      size: Math.max(1, Math.min(100, prev.size + delta))
    }));
  }, []);

  const adjustOffsetX = useCallback((delta: number) => {
    setGridSettings(prev => ({
      ...prev,
      offsetX: Math.max(-imageData.width, Math.min(imageData.width, prev.offsetX + delta))
    }));
  }, [imageData.width]);

  const adjustOffsetY = useCallback((delta: number) => {
    setGridSettings(prev => ({
      ...prev,
      offsetY: Math.max(-imageData.height, Math.min(imageData.height, prev.offsetY + delta))
    }));
  }, [imageData.height]);

  const adjustZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const adjustCellShading = useCallback((delta: number) => {
    setCellShadingIntensity(prev => Math.max(0, Math.min(100, prev + delta)));
  }, []);

  // Snap output size to fit the grid sampling
  const snapOutputToGrid = useCallback(() => {
    if (!imageData.url) return;
    
    const { size: gridSize, offsetX, offsetY } = gridSettings;
    const effectiveWidth = imageData.width - offsetX;
    const effectiveHeight = imageData.height - offsetY;
    
    // Calculate how many grid cells fit in the effective area
    const outputWidth = Math.floor(effectiveWidth / gridSize);
    const outputHeight = Math.floor(effectiveHeight / gridSize);
    
    // Ensure minimum size of 1x1
    const finalWidth = Math.max(1, outputWidth);
    const finalHeight = Math.max(1, outputHeight);
    
    // Set custom output size to match grid sampling
    setOutputSettings(prev => ({
      ...prev,
      size: 'custom',
      customWidth: finalWidth,
      customHeight: finalHeight
    }));
  }, [imageData, gridSettings]);

  // Apply cell shading (legacy function for main canvas)
  const applyCellShading = useCallback((ctx: CanvasRenderingContext2D) => {
    if (cellShadingIntensity === 0 || !imageData.url || colorPalette.dominantColors.length === 0) return;
    
    const canvasImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = canvasImageData.data;
    
    // Calculate how many colors to use based on intensity
    const maxColors = Math.max(2, Math.floor(16 * (1 - cellShadingIntensity / 100)));
    const colors = colorPalette.dominantColors.slice(0, maxColors);
    
    // Parse colors once for better performance
    const parsedColors = colors.map(color => {
      const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      return match ? {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      } : null;
    }).filter(Boolean);
    
    if (parsedColors.length === 0) return;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Find closest color in palette
      let closestColor = parsedColors[0]!;
      let minDistance = Infinity;
      
      for (const color of parsedColors) {
        if (!color) continue;
        
        const distance = Math.sqrt(
          Math.pow(r - color.r, 2) + Math.pow(g - color.g, 2) + Math.pow(b - color.b, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color;
        }
      }
      
      // Apply closest color
      data[i] = closestColor.r;
      data[i + 1] = closestColor.g;
      data[i + 2] = closestColor.b;
    }
    
    ctx.putImageData(canvasImageData, 0, 0);
  }, [cellShadingIntensity, colorPalette]);

  // Render thumbnail preview
  const renderThumbnail = useCallback(() => {
    if (!thumbnailCanvasRef.current || !imageData.url || !imageRef.current) return;
    
    const canvas = thumbnailCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    const outputSize = getOutputSize();
    
    // Set canvas dimensions based on preview scale
    const scaledWidth = outputSize.width * outputSettings.previewScale;
    const scaledHeight = outputSize.height * outputSettings.previewScale;
    
    // Update canvas size if it changed
    if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw transparent background pattern (toned-down red)
    const patternSize = 8 * outputSettings.previewScale;
    ctx.fillStyle = '#ffcccc'; // Light red background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw checkerboard pattern for transparency
    ctx.fillStyle = '#ff9999'; // Slightly darker red for pattern
    for (let y = 0; y < canvas.height; y += patternSize * 2) {
      for (let x = 0; x < canvas.width; x += patternSize * 2) {
        // Draw alternating squares
        ctx.fillRect(x, y, patternSize, patternSize);
        ctx.fillRect(x + patternSize, y + patternSize, patternSize, patternSize);
      }
    }
    
    // Create a temporary canvas to draw the original image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.drawImage(img, 0, 0);
    
    // Create a pixel art canvas
    const pixelArtCanvas = document.createElement('canvas');
    const pixelArtCtx = pixelArtCanvas.getContext('2d');
    if (!pixelArtCtx) return;
    
    pixelArtCanvas.width = outputSize.width;
    pixelArtCanvas.height = outputSize.height;
    
    // Sample grid pixels to create pixel art
    sampleGridPixels(tempCanvas, pixelArtCanvas);
    
    // Draw the pixel art at the correct scale
    ctx.imageSmoothingEnabled = false; // Keep pixels sharp
    ctx.drawImage(pixelArtCanvas, 0, 0, scaledWidth, scaledHeight);
  }, [imageData, outputSettings, getOutputSize, sampleGridPixels]);

  // Render grid overlay
  const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!imageData.url) return;
    
    const { size, offsetX, offsetY, showCoordinates } = gridSettings;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Draw vertical lines
    for (let x = offsetX; x <= imageData.width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, imageData.height);
      ctx.stroke();
      
      if (showCoordinates) {
        const col = Math.floor((x - offsetX) / size);
        ctx.fillText(col.toString(), x + 2, 12);
      }
    }
    
    // Draw horizontal lines
    for (let y = offsetY; y <= imageData.height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(imageData.width, y);
      ctx.stroke();
      
      if (showCoordinates) {
        const row = Math.floor((y - offsetY) / size);
        ctx.fillText(row.toString(), 2, y - 2);
      }
    }
  }, [imageData, gridSettings]);

  // Handle wheel events with proper passive listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
    };
    
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, []);

    // Main render function
  useEffect(() => {
    if (!canvasRef.current || !imageData.url || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    
    // Set canvas size
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
          // Draw the original image without offset (offset only affects grid position)
      ctx.drawImage(img, 0, 0);
    
    // Apply cell shading if enabled
    if (livePreview) {
      applyCellShading(ctx);
    }
    
    // Draw grid overlay
    renderGrid(ctx);
    
    // Render thumbnail
    renderThumbnail();
  }, [imageData, gridSettings, cellShadingIntensity, livePreview, applyCellShading, renderGrid, renderThumbnail]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Pixelite</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
          {/* Left Panel - Controls */}
          <div className={styles.controlsPanel}>
            <div className={styles.section}>
              <h3>🖼️ Image Management</h3>
              <div 
                ref={dropZoneRef}
                className={styles.dropZone}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageData.url ? (
                  <div className={styles.imageInfo}>
                    <img src={imageData.url} alt="Preview" className={styles.thumbnail} />
                    <p>{imageData.name}</p>
                    <p>{imageData.width} × {imageData.height}</p>
                  </div>
                ) : (
                  <div className={styles.dropZoneContent}>
                    <p>Drop image here or click to browse</p>
                    <p>Supports: PNG, JPG, GIF, WebP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              {imageData.url && (
                <button className={styles.button} onClick={resetImage}>
                  Reset Image
                </button>
              )}
            </div>

            <div className={styles.section}>
              <h3>📐 Grid System</h3>
              <div className={styles.control}>
                <label>Grid Size:</label>
                <div className={styles.sliderContainer}>
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustGridSize(-1)}
                    title="Decrease"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={gridSettings.size}
                    onChange={(e) => setGridSettings(prev => ({ 
                      ...prev, 
                      size: parseInt(e.target.value) 
                    }))}
                  />
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustGridSize(1)}
                    title="Increase"
                  >
                    +
                  </button>
                  <span className={styles.sliderValue}>{gridSettings.size}px</span>
                </div>
              </div>
              <div className={styles.control}>
                <label>Offset X:</label>
                <div className={styles.sliderContainer}>
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustOffsetX(-1)}
                    title="Decrease"
                  >
                    -
                  </button>
                                     <input
                     type="range"
                     min={-imageData.width}
                     max={imageData.width}
                     value={gridSettings.offsetX}
                     onChange={(e) => setGridSettings(prev => ({ 
                       ...prev, 
                       offsetX: parseInt(e.target.value) 
                     }))}
                   />
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustOffsetX(1)}
                    title="Increase"
                  >
                    +
                  </button>
                  <span className={styles.sliderValue}>{gridSettings.offsetX}px</span>
                </div>
              </div>
              <div className={styles.control}>
                <label>Offset Y:</label>
                <div className={styles.sliderContainer}>
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustOffsetY(-1)}
                    title="Decrease"
                  >
                    -
                  </button>
                                     <input
                     type="range"
                     min={-imageData.height}
                     max={imageData.height}
                     value={gridSettings.offsetY}
                     onChange={(e) => setGridSettings(prev => ({ 
                       ...prev, 
                       offsetY: parseInt(e.target.value) 
                     }))}
                   />
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustOffsetY(1)}
                    title="Increase"
                  >
                    +
                  </button>
                  <span className={styles.sliderValue}>{gridSettings.offsetY}px</span>
                </div>
              </div>
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={gridSettings.showCoordinates}
                  onChange={(e) => setGridSettings(prev => ({ 
                    ...prev, 
                    showCoordinates: e.target.checked 
                  }))}
                />
                <label>Show Coordinates</label>
              </div>
                             <div className={styles.checkbox}>
                 <input
                   type="checkbox"
                   checked={gridSettings.snapToGrid}
                   onChange={(e) => setGridSettings(prev => ({ 
                     ...prev, 
                     snapToGrid: e.target.checked 
                   }))}
                 />
                 <label>Snap to Grid</label>
               </div>
                               {imageData.url && (
                  <>
                    <button 
                      className={styles.button} 
                      onClick={snapOutputToGrid}
                      title="Adjust output size to match current grid settings"
                    >
                      SNAP
                    </button>
                    <button 
                      className={styles.button} 
                      onClick={() => setGridSettings(prev => ({ ...prev, offsetX: 0, offsetY: 0 }))}
                      title="Reset grid offset to center"
                    >
                      Reset Offset
                    </button>
                  </>
                )}
            </div>

                         <div className={styles.section}>
               <h3>🎨 Cell Shading</h3>
                               <div className={styles.control}>
                  <label>Intensity:</label>
                  <div className={styles.sliderContainer}>
                    <button 
                      className={styles.sliderButton} 
                      onClick={() => adjustCellShading(-1)}
                      title="Decrease"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cellShadingIntensity}
                      onChange={(e) => setCellShadingIntensity(parseInt(e.target.value))}
                    />
                    <button 
                      className={styles.sliderButton} 
                      onClick={() => adjustCellShading(1)}
                      title="Increase"
                    >
                      +
                    </button>
                    <span className={styles.sliderValue}>{cellShadingIntensity}%</span>
                  </div>
                </div>
              {colorPalette.colors.length > 0 && (
                <div className={styles.palette}>
                  <h4>Color Palette:</h4>
                  <div className={styles.colorGrid}>
                    {colorPalette.colors.map((color, index) => (
                      <div
                        key={index}
                        className={styles.colorSwatch}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.section}>
              <h3>🔍 Preview Options</h3>
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={livePreview}
                  onChange={(e) => setLivePreview(e.target.checked)}
                />
                <label>Live Preview</label>
              </div>
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={showPalette}
                  onChange={(e) => setShowPalette(e.target.checked)}
                />
                <label>Show Palette</label>
              </div>
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={showThumbnail}
                  onChange={(e) => setShowThumbnail(e.target.checked)}
                />
                <label>Show Thumbnail</label>
              </div>
            </div>

            <div className={styles.section}>
              <h3>📐 Navigation</h3>
              <div className={styles.control}>
                <label>Zoom:</label>
                <div className={styles.sliderContainer}>
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustZoom(-0.1)}
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                  <button 
                    className={styles.sliderButton} 
                    onClick={() => adjustZoom(0.1)}
                    title="Zoom In"
                  >
                    +
                  </button>
                  <span className={styles.sliderValue}>{Math.round(zoom * 100)}%</span>
                </div>
              </div>
              <button className={styles.button} onClick={resetView}>
                Reset View
              </button>
              <button className={styles.button} onClick={() => setZoom(1)}>
                Fit to Screen
              </button>
            </div>

                         <div className={styles.section}>
               <h3>📏 Output Settings</h3>
               <div className={styles.control}>
                 <label>Output Size:</label>
                 <select
                   value={outputSettings.size}
                   onChange={(e) => setOutputSettings(prev => ({ 
                     ...prev, 
                     size: e.target.value as any 
                   }))}
                 >
                   <option value="16x16">16 × 16</option>
                   <option value="32x32">32 × 32</option>
                   <option value="64x64">64 × 64</option>
                   <option value="64x128">64 × 128</option>
                   <option value="128x64">128 × 64</option>
                   <option value="custom">Custom</option>
                 </select>
               </div>
               {outputSettings.size === 'custom' && (
                 <>
                   <div className={styles.control}>
                     <label>Custom Width:</label>
                     <div className={styles.sliderContainer}>
                       <button 
                         className={styles.sliderButton} 
                         onClick={() => setOutputSettings(prev => ({
                           ...prev,
                           customWidth: Math.max(1, prev.customWidth - 1)
                         }))}
                         title="Decrease"
                       >
                         -
                       </button>
                       <input
                         type="range"
                         min="1"
                         max="256"
                         value={outputSettings.customWidth}
                         onChange={(e) => setOutputSettings(prev => ({ 
                           ...prev, 
                           customWidth: parseInt(e.target.value) 
                         }))}
                       />
                       <button 
                         className={styles.sliderButton} 
                         onClick={() => setOutputSettings(prev => ({
                           ...prev,
                           customWidth: Math.min(256, prev.customWidth + 1)
                         }))}
                         title="Increase"
                       >
                         +
                       </button>
                       <span className={styles.sliderValue}>{outputSettings.customWidth}px</span>
                     </div>
                   </div>
                   <div className={styles.control}>
                     <label>Custom Height:</label>
                     <div className={styles.sliderContainer}>
                       <button 
                         className={styles.sliderButton} 
                         onClick={() => setOutputSettings(prev => ({
                           ...prev,
                           customHeight: Math.max(1, prev.customHeight - 1)
                         }))}
                         title="Decrease"
                       >
                         -
                       </button>
                       <input
                         type="range"
                         min="1"
                         max="256"
                         value={outputSettings.customHeight}
                         onChange={(e) => setOutputSettings(prev => ({ 
                           ...prev, 
                           customHeight: parseInt(e.target.value) 
                         }))}
                       />
                       <button 
                         className={styles.sliderButton} 
                         onClick={() => setOutputSettings(prev => ({
                           ...prev,
                           customHeight: Math.min(256, prev.customHeight + 1)
                         }))}
                         title="Increase"
                       >
                         +
                       </button>
                       <span className={styles.sliderValue}>{outputSettings.customHeight}px</span>
                     </div>
                   </div>
                 </>
               )}
               <div className={styles.control}>
                 <label>Preview Scale:</label>
                 <select
                   value={outputSettings.previewScale}
                   onChange={(e) => setOutputSettings(prev => ({ 
                     ...prev, 
                     previewScale: parseInt(e.target.value) as 1 | 2 | 4
                   }))}
                 >
                   <option value={1}>1×</option>
                   <option value={2}>2×</option>
                   <option value={4}>4×</option>
                 </select>
               </div>
             </div>

             <div className={styles.section}>
               <h3>💾 Export</h3>
               <button className={styles.button} onClick={exportPNG}>
                 Download PNG
               </button>
               <button className={styles.button} onClick={copyToClipboard}>
                 Copy to Clipboard
               </button>
             </div>
          </div>

          {/* Right Panel - Canvas */}
          <div className={styles.canvasPanel}>
            <div className={styles.canvasContainer}>
                             <canvas
                 ref={canvasRef}
                 className={styles.canvas}
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}
                 style={{
                   transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                   cursor: isDragging ? 'grabbing' : 'grab'
                 }}
               />
              {imageData.url && (
                <div className={styles.coordinates}>
                  Mouse: ({mousePosition.x}, {mousePosition.y})
                </div>
              )}
            </div>
            
                         {showThumbnail && imageData.url && (
               <div className={styles.thumbnailPreview}>
                 <h4>Output Preview ({outputSettings.previewScale}×):</h4>
                 <div className={styles.thumbnailInfo}>
                   <p>Original: {imageData.width} × {imageData.height}</p>
                   <p>Output: {getOutputSize().width} × {getOutputSize().height}</p>
                   <p>Preview: {getOutputSize().width * outputSettings.previewScale} × {getOutputSize().height * outputSettings.previewScale}</p>
                 </div>
                                   <div className={styles.thumbnailContainer}>
                    <canvas
                      ref={thumbnailCanvasRef}
                      className={styles.thumbnailCanvas}
                      style={{
                        imageRendering: 'pixelated'
                      }}
                    />
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Hidden image for processing */}
      {imageData.url && (
        <img
          ref={imageRef}
          src={imageData.url}
          alt="Processing"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default Pixelite; 