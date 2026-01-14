// UI控制模块
import { FileHandler } from './fileHandler.js';

export class UIController {
    constructor() {
        this.fileHandler = new FileHandler();
        this.messageTimeout = null;
    }

    showWelcome() {
        console.log('图片转PDF工具已就绪');
    }

    displayPreview(files, removeCallback) {
        const previewSection = document.getElementById('previewSection');
        const previewGrid = document.getElementById('previewGrid');
        
        previewSection.classList.remove('hidden');
        previewSection.classList.add('fade-in');
        
        previewGrid.innerHTML = '';

        files.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const card = this.createPreviewCard(file, e.target.result, index, removeCallback);
                previewGrid.appendChild(card);
            };
            
            reader.readAsDataURL(file);
        });

        // 滚动到预览区域
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    createPreviewCard(file, dataURL, index, removeCallback) {
        const card = document.createElement('div');
        card.className = 'preview-card fade-in';
        
        card.innerHTML = `
            <img src="${dataURL}" alt="${file.name}">
            <button class="remove-btn" data-index="${index}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${this.fileHandler.formatFileSize(file.size)}</div>
            </div>
        `;

        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.add('fade-out');
            setTimeout(() => {
                removeCallback(index);
            }, 300);
        });

        return card;
    }

    hidePreview() {
        const previewSection = document.getElementById('previewSection');
        previewSection.classList.add('hidden');
    }

    showProgress() {
        const progressSection = document.getElementById('progressSection');
        progressSection.classList.remove('hidden');
        progressSection.classList.add('fade-in');
        
        this.updateProgress(0);
    }

    updateProgress(percent) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = percent + '%';
        progressText.textContent = `转换中... ${percent}%`;
    }

    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        setTimeout(() => {
            progressSection.classList.add('hidden');
        }, 1000);
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // 清除之前的消息
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // 移除旧消息
        const oldMessage = document.querySelector('.message-toast');
        if (oldMessage) {
            oldMessage.remove();
        }

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast fixed top-20 right-4 z-50 ${type === 'success' ? 'success-message' : 'error-message'} fade-in`;
        
        const icon = type === 'success' 
            ? '<svg class="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        
        messageDiv.innerHTML = `
            <div class="flex items-center">
                ${icon}
                <span class="font-semibold">${message}</span>
            </div>
        `;

        document.body.appendChild(messageDiv);

        // 自动移除消息
        this.messageTimeout = setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            messageDiv.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }, 3000);
    }
}