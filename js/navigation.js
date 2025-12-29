/**
 * ステップナビゲーション管理
 */

class StepNavigator {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.totalSteps = steps.length;
    }

    /**
     * 現在のステップ情報を取得
     */
    getCurrentStep() {
        return this.steps[this.currentStep];
    }

    /**
     * 次のステップへ
     */
    next() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            return true;
        }
        return false;
    }

    /**
     * 前のステップへ
     */
    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            return true;
        }
        return false;
    }

    /**
     * 最初のステップか
     */
    isFirst() {
        return this.currentStep === 0;
    }

    /**
     * 最後のステップか
     */
    isLast() {
        return this.currentStep === this.totalSteps - 1;
    }
}

/**
 * 画面を更新
 */
function renderStep(navigator) {
    const step = navigator.getCurrentStep();

    // ステップ番号
    const indicator = document.querySelector('.step-indicator__current');
    if (indicator) {
        indicator.textContent = navigator.currentStep + 1;
    }

    const totalIndicator = document.querySelector('.step-indicator__total');
    if (totalIndicator) {
        totalIndicator.textContent = navigator.totalSteps;
    }

    // コンテンツ更新
    const contentText = document.querySelector('.content__text');
    if (contentText) {
        contentText.innerHTML = step.text;
    }

    // 画像更新
    const contentImage = document.querySelector('.content__image');
    const placeholder = document.querySelector('.placeholder-image');

    if (step.image) {
        if (contentImage) {
            contentImage.src = step.image;
            contentImage.alt = step.imageAlt || '';
            contentImage.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
    } else {
        if (contentImage) contentImage.style.display = 'none';
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.querySelector('.placeholder-image__text').textContent =
                step.imagePlaceholder || '画像を挿入予定';
        }
    }

    // 警告バッジ
    const warningBadge = document.querySelector('.warning-badge');
    if (warningBadge) {
        warningBadge.style.display = step.showWarning ? 'flex' : 'none';
    }

    // ボタンの表示/非表示
    const prevBtn = document.querySelector('.btn--prev');
    const nextBtn = document.querySelector('.btn--next');

    if (prevBtn) {
        prevBtn.style.visibility = navigator.isFirst() ? 'hidden' : 'visible';
    }

    if (nextBtn) {
        if (navigator.isLast()) {
            nextBtn.textContent = '完了 ✓';
            nextBtn.classList.add('btn--success');
            nextBtn.onclick = () => showComplete();
        } else {
            nextBtn.textContent = '次へ →';
            nextBtn.classList.remove('btn--success');
        }
    }

    // 法的注記
    const legalContent = document.querySelector('.legal-notes__content');
    if (legalContent) {
        if (step.legalNote) {
            legalContent.innerHTML = step.legalNote;
            document.querySelector('.legal-notes').style.display = 'block';
        } else {
            document.querySelector('.legal-notes').style.display = 'none';
        }
    }

    // 音声は🔊ボタンを押したときだけ再生（自動再生オフ）

    // プログレスバーを更新
    updateProgressBar(navigator);
}

/**
 * 次へボタン押下
 */
function goNext(navigator) {
    voiceNav.stop();
    if (navigator.next()) {
        renderStep(navigator);
    }
}

/**
 * 戻るボタン押下
 */
function goPrev(navigator) {
    voiceNav.stop();
    if (navigator.prev()) {
        renderStep(navigator);
    }
}

/**
 * 完了画面を表示
 */
function showComplete() {
    voiceNav.stop();
    document.querySelector('.step-content').style.display = 'none';
    document.querySelector('.complete').style.display = 'block';
}

/**
 * 完了画面から前のステップに戻る
 */
function goBackFromComplete(navigator) {
    voiceNav.stop();
    document.querySelector('.complete').style.display = 'none';
    document.querySelector('.step-content').style.display = 'block';
    renderStep(navigator);
}

/**
 * 法的注記のトグル
 */
function toggleLegalNotes() {
    const content = document.querySelector('.legal-notes__content');
    const toggle = document.querySelector('.legal-notes__toggle');

    if (content.classList.contains('is-open')) {
        content.classList.remove('is-open');
        toggle.innerHTML = '▶ 法的注意事項を見る';
    } else {
        content.classList.add('is-open');
        toggle.innerHTML = '▼ 法的注意事項を閉じる';
    }
}

/**
 * プログレスバーを更新
 * @param {StepNavigator} navigator 
 */
function updateProgressBar(navigator) {
    const fill = document.querySelector('.progress-bar__fill');
    if (fill) {
        const progress = ((navigator.currentStep + 1) / navigator.totalSteps) * 100;
        fill.style.width = progress + '%';
    }
}

/**
 * 電話モーダルを表示
 */
function showPhoneModal() {
    const modal = document.querySelector('.phone-modal');
    if (modal) {
        modal.classList.add('is-open');
        voiceNav.speak('お電話でのご相談も承っております。下の緑のボタンをタップしてください。');
    }
}

/**
 * 電話モーダルを閉じる
 */
function closePhoneModal() {
    const modal = document.querySelector('.phone-modal');
    if (modal) {
        modal.classList.remove('is-open');
    }
    voiceNav.stop();
}

/**
 * 音声許可ボタンがクリックされた時
 */
function enableAudioManually() {
    voiceNav.audioEnabled = true;
    sessionStorage.setItem('audioEnabled', 'true');

    const banner = document.querySelector('.audio-permission');
    if (banner) {
        banner.classList.remove('is-visible');
    }

    // 待機中のテキストがあれば再生
    if (voiceNav.pendingText) {
        setTimeout(() => {
            voiceNav.speak(voiceNav.pendingText);
            voiceNav.pendingText = null;
        }, 300);
    }
}

