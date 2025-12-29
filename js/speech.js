/**
 * 音声読み上げ機能 (Web Speech API)
 * 高齢者向けにゆっくり読み上げ
 * iOS/Safari対応版
 */

class VoiceNavigator {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.rate = 0.8; // ゆっくり読み上げ
    this.pitch = 1.0;
    this.volume = 1.0;
    this.voice = null;
    this.audioEnabled = false; // iOS対応: ユーザー操作後に有効化
    this.pendingText = null; // 待機中のテキスト

    this.init();
  }

  init() {
    // 日本語音声を設定
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.setJapaneseVoice();
    }
    // 即座に試行
    this.setJapaneseVoice();

    // iOS対応: 最初のユーザー操作を検出
    this.setupAudioPermission();
  }

  /**
   * iOS対応: 音声許可バナーを設定
   */
  setupAudioPermission() {
    // すでに許可されているか確認（sessionStorageで記憶）
    if (sessionStorage.getItem('audioEnabled') === 'true') {
      this.audioEnabled = true;
      return;
    }

    // ユーザーの最初のタップで音声を有効化
    const enableAudio = () => {
      // ダミー発声で音声エンジンを起動（iOS対策）
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      this.synth.speak(dummy);

      this.audioEnabled = true;
      sessionStorage.setItem('audioEnabled', 'true');

      // 許可バナーを非表示
      const banner = document.querySelector('.audio-permission');
      if (banner) {
        banner.classList.remove('is-visible');
      }

      // 待機中のテキストがあれば再生
      if (this.pendingText) {
        setTimeout(() => {
          this.speak(this.pendingText);
          this.pendingText = null;
        }, 300);
      }

      // イベントリスナーを削除
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
  }

  setJapaneseVoice() {
    const voices = this.synth.getVoices();
    // 日本語音声を優先的に選択
    this.voice = voices.find(v => v.lang === 'ja-JP') ||
      voices.find(v => v.lang.startsWith('ja')) ||
      voices[0];
  }

  /**
   * テキストを読み上げ
   * @param {string} text - 読み上げるテキスト
   * @param {Function} onEnd - 読み上げ完了時のコールバック
   */
  speak(text, onEnd = null) {
    // iOS対応: 音声が有効でなければ待機
    if (!this.audioEnabled) {
      this.pendingText = text;
      // 許可バナーを表示
      const banner = document.querySelector('.audio-permission');
      if (banner) {
        banner.classList.add('is-visible');
      }
      return;
    }

    // 既存の読み上げを完全に停止
    this.synth.cancel();

    // iOS対策: cancel後に少し待ってから新しい音声を再生
    setTimeout(() => {
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = this.rate;
      this.utterance.pitch = this.pitch;
      this.utterance.volume = this.volume;

      if (this.voice) {
        this.utterance.voice = this.voice;
      }
      this.utterance.lang = 'ja-JP';

      this.utterance.onstart = () => {
        this.isPlaying = true;
        this.updatePlayButton(true);
      };

      this.utterance.onend = () => {
        this.isPlaying = false;
        this.updatePlayButton(false);
        if (onEnd) onEnd();
      };

      this.utterance.onerror = (e) => {
        console.error('Speech error:', e);
        this.isPlaying = false;
        this.updatePlayButton(false);
      };

      this.synth.speak(this.utterance);
    }, 100);
  }

  /**
   * 読み上げを停止
   */
  stop() {
    this.synth.cancel();
    this.isPlaying = false;
    this.updatePlayButton(false);
  }

  /**
   * 再生/停止をトグル
   * @param {string} text - 読み上げるテキスト
   */
  toggle(text) {
    // 音声を有効化（iOS対策）
    if (!this.audioEnabled) {
      this.audioEnabled = true;
      sessionStorage.setItem('audioEnabled', 'true');
      const banner = document.querySelector('.audio-permission');
      if (banner) banner.classList.remove('is-visible');
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.speak(text);
    }
  }

  /**
   * 再生ボタンの見た目を更新
   */
  updatePlayButton(isPlaying) {
    const btn = document.querySelector('.audio-control__btn');
    if (btn) {
      if (isPlaying) {
        btn.classList.add('audio-control__btn--playing');
        btn.innerHTML = '⏹';
        btn.setAttribute('aria-label', '停止');
      } else {
        btn.classList.remove('audio-control__btn--playing');
        btn.innerHTML = '🔊';
        btn.setAttribute('aria-label', '読み上げ');
      }
    }
  }
}

// グローバルインスタンス
const voiceNav = new VoiceNavigator();

/**
 * ページ読み込み時に自動読み上げ
 * @param {string} text - 読み上げるテキスト
 */
function autoSpeak(text) {
  // 少し遅延させてから読み上げ開始
  setTimeout(() => {
    voiceNav.speak(text);
  }, 500);
}

/**
 * 読み上げボタンクリック時
 * @param {string} text - 読み上げるテキスト
 */
function toggleSpeak(text) {
  voiceNav.toggle(text);
}
