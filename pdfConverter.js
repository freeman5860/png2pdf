// PDF转换模块
import { FileHandler } from './fileHandler.js';

export class PDFConverter {
    constructor() {
        this.fileHandler = new FileHandler();
        this.jsPDF = window.jspdf.jsPDF;
    }

    async convert(files, settings, progressCallback) {
        const { orientation, pageSize, quality } = settings;
        
        // 创建PDF文档
        const pdf = new this.jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageSize
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        let isFirstPage = true;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 更新进度
            const progress = Math.round(((i + 1) / files.length) * 100);
            if (progressCallback) {
                progressCallback(progress);
            }

            try {
                // 读取文件
                const dataURL = await this.fileHandler.readFileAsDataURL(file);
                const img = await this.fileHandler.loadImage(dataURL);

                // 如果不是第一页，添加新页面
                if (!isFirstPage) {
                    pdf.addPage();
                } else {
                    isFirstPage = false;
                }

                // 计算图片尺寸以适应页面
                const imgWidth = img.width;
                const imgHeight = img.height;
                const availableWidth = pageWidth - (margin * 2);
                const availableHeight = pageHeight - (margin * 2);

                let finalWidth, finalHeight;

                // 根据图片比例调整大小
                const imgRatio = imgWidth / imgHeight;
                const pageRatio = availableWidth / availableHeight;

                if (imgRatio > pageRatio) {
                    // 图片更宽，以宽度为准
                    finalWidth = availableWidth;
                    finalHeight = availableWidth / imgRatio;
                } else {
                    // 图片更高，以高度为准
                    finalHeight = availableHeight;
                    finalWidth = availableHeight * imgRatio;
                }

                // 居中放置图片
                const x = (pageWidth - finalWidth) / 2;
                const y = (pageHeight - finalHeight) / 2;

                // 根据质量设置压缩
                let compression = 'MEDIUM';
                if (quality === 'high') {
                    compression = 'SLOW';
                } else if (quality === 'low') {
                    compression = 'FAST';
                }

                // 根据文件类型确定图片格式
                let imageFormat = 'PNG';
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    imageFormat = 'JPEG';
                } else if (file.type === 'image/png') {
                    imageFormat = 'PNG';
                } else if (file.type === 'image/webp') {
                    imageFormat = 'WEBP';
                } else if (file.type === 'image/bmp') {
                    imageFormat = 'BMP';
                } else if (file.type === 'image/gif') {
                    imageFormat = 'GIF';
                }

                // 添加图片到PDF
                pdf.addImage(
                    dataURL,
                    imageFormat,
                    x,
                    y,
                    finalWidth,
                    finalHeight,
                    undefined,
                    compression
                );

            } catch (error) {
                console.error(`处理文件 ${file.name} 时出错:`, error);
                throw new Error(`处理文件 ${file.name} 失败`);
            }
        }

        // 生成文件名
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `图片转PDF_${timestamp}.pdf`;

        // 保存PDF
        pdf.save(fileName);

        return fileName;
    }

    getPageDimensions(pageSize) {
        const dimensions = {
            'a4': { width: 210, height: 297 },
            'letter': { width: 216, height: 279 },
            'legal': { width: 216, height: 356 }
        };

        return dimensions[pageSize] || dimensions['a4'];
    }
}