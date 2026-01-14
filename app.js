// PNG转PDF主应用程序
import { FileHandler } from './fileHandler.js';
import { PDFConverter } from './pdfConverter.js';
import { UIController } from './uiController.js';

class App {
    constructor() {
        this.fileHandler = new FileHandler();
        this.pdfConverter = new PDFConverter();
        this.uiController = new UIController();
        this.selectedFiles = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.uiController.showWelcome();
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const selectBtn = document.getElementById('selectBtn');
        const convertBtn = document.getElementById('convertBtn');
        const clearBtn = document.getElementById('clearBtn');

        // 点击选择文件
        selectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖拽事件
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // 转换按钮
        convertBtn.addEventListener('click', () => {
            this.convertToPDF();
        });

        // 清空按钮
        clearBtn.addEventListener('click', () => {
            this.clearFiles();
        });
    }

    handleFiles(files) {
        const validFiles = this.fileHandler.validateFiles(files);
        
        if (validFiles.length === 0) {
            this.uiController.showError('请选择有效的PNG图片文件');
            return;
        }

        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        this.uiController.displayPreview(this.selectedFiles, (index) => {
            this.removeFile(index);
        });
        
        this.uiController.showSuccess(`成功添加 ${validFiles.length} 个文件`);
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        
        if (this.selectedFiles.length === 0) {
            this.uiController.hidePreview();
        } else {
            this.uiController.displayPreview(this.selectedFiles, (index) => {
                this.removeFile(index);
            });
        }
    }

    clearFiles() {
        this.selectedFiles = [];
        this.uiController.hidePreview();
        document.getElementById('fileInput').value = '';
        this.uiController.showSuccess('已清空所有文件');
    }

    async convertToPDF() {
        if (this.selectedFiles.length === 0) {
            this.uiController.showError('请先选择要转换的PNG图片');
            return;
        }

        try {
            // 获取设置
            const settings = {
                orientation: document.getElementById('orientation').value,
                pageSize: document.getElementById('pageSize').value,
                quality: document.getElementById('quality').value
            };

            // 显示进度
            this.uiController.showProgress();

            // 转换为PDF
            await this.pdfConverter.convert(
                this.selectedFiles,
                settings,
                (progress) => {
                    this.uiController.updateProgress(progress);
                }
            );

            this.uiController.hideProgress();
            this.uiController.showSuccess('PDF转换成功！文件已开始下载');

            // 转换成功后清空文件
            setTimeout(() => {
                this.clearFiles();
            }, 2000);

        } catch (error) {
            console.error('转换失败:', error);
            this.uiController.hideProgress();
            this.uiController.showError('转换失败: ' + error.message);
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

export default App;