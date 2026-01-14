// 文件处理模块
export class FileHandler {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/png'];
    }

    validateFiles(files) {
        const validFiles = [];
        const fileArray = Array.from(files);

        for (const file of fileArray) {
            if (!this.allowedTypes.includes(file.type)) {
                console.warn(`文件 ${file.name} 不是PNG格式，已跳过`);
                continue;
            }

            if (file.size > this.maxFileSize) {
                console.warn(`文件 ${file.name} 超过大小限制，已跳过`);
                continue;
            }

            validFiles.push(file);
        }

        return validFiles;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsDataURL(file);
        });
    }

    async loadImage(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve(img);
            };
            
            img.onerror = (error) => {
                reject(error);
            };
            
            img.src = dataURL;
        });
    }
}