import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Point, CaptureProgress, DEFAULT_CAPTURE_SPEED } from '../types';

type CoordinateMode = 'none' | 'topLeft' | 'bottomRight';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [topLeft, setTopLeft] = useState<Point>({ x: 0, y: 0 });
  const [bottomRight, setBottomRight] = useState<Point>({ x: 0, y: 0 });
  const [totalPages, setTotalPages] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [captureSpeed, setCaptureSpeed] = useState<string>(String(DEFAULT_CAPTURE_SPEED));
  const [progress, setProgress] = useState<CaptureProgress>({
    current: 0,
    total: 0,
    status: 'idle'
  });
  const [coordinateMode, setCoordinateMode] = useState<CoordinateMode>('none');
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);

  useEffect(() => {
    window.electronAPI.onCaptureProgress((progressData) => {
      setProgress(progressData);
    });
  }, []);

  useEffect(() => {
    if (coordinateMode !== 'none') {
      document.body.style.cursor = 'crosshair';
      
      const handleGlobalClick = async () => {
        const position = await window.electronAPI.getCursorPosition();
        
        if (coordinateMode === 'topLeft') {
          setTopLeft(position);
        } else if (coordinateMode === 'bottomRight') {
          setBottomRight(position);
        }
        
        setCoordinateMode('none');
        document.body.style.cursor = 'default';
      };

      window.addEventListener('click', handleGlobalClick);
      
      return () => {
        window.removeEventListener('click', handleGlobalClick);
        document.body.style.cursor = 'default';
      };
    }
  }, [coordinateMode]);

  const handleTopLeftClick = (): void => {
    setCoordinateMode('topLeft');
  };

  const handleBottomRightClick = (): void => {
    setCoordinateMode('bottomRight');
  };

  const handleStartCapture = async (): Promise<void> => {
    if (!totalPages || !fileName) {
      alert(t('message.fillAllFields'));
      return;
    }

    const pages = parseInt(totalPages, 10);
    if (isNaN(pages) || pages <= 0) {
      alert(t('message.fillAllFields'));
      return;
    }

    const speed = parseInt(captureSpeed, 10);
    if (isNaN(speed) || speed < 500 || speed > 5000) {
      alert(t('message.fillAllFields'));
      return;
    }

    if (topLeft.x === 0 && topLeft.y === 0) {
      alert(t('message.coordinatesNotSet'));
      return;
    }

    if (bottomRight.x === 0 && bottomRight.y === 0) {
      alert(t('message.coordinatesNotSet'));
      return;
    }

    try {
      await window.electronAPI.startCapture({
        topLeft,
        bottomRight,
        totalPages: pages,
        fileName,
        captureSpeed: speed
      });
    } catch (error) {
      console.error('Capture error:', error);
      alert(t('message.errorOccurred', { error: String(error) }));
    }
  };

  const handleReset = async (): Promise<void> => {
    setTopLeft({ x: 0, y: 0 });
    setBottomRight({ x: 0, y: 0 });
    setTotalPages('');
    setFileName('');
    setCaptureSpeed(String(DEFAULT_CAPTURE_SPEED));
    setProgress({ current: 0, total: 0, status: 'idle' });
    setCoordinateMode('none');
    await window.electronAPI.reset();
  };

  const changeLanguage = (lang: string): void => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const getLanguageLabel = (): string => {
    const labels: Record<string, string> = {
      en: 'EN',
      ko: 'KO',
      ja: 'JA',
      zh: 'ZH'
    };
    return labels[i18n.language] || 'EN';
  };

  const isCapturing = progress.status === 'capturing' || progress.status === 'converting';

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">{t('app.title')}</h1>
        <div className="lang-selector">
          <button 
            className="lang-button" 
            onClick={() => setShowLangMenu(!showLangMenu)}
          >
            {getLanguageLabel()} ▼
          </button>
          {showLangMenu && (
            <div className="lang-menu">
              <button onClick={() => changeLanguage('en')}>English</button>
              <button onClick={() => changeLanguage('ko')}>한국어</button>
              <button onClick={() => changeLanguage('ja')}>日本語</button>
              <button onClick={() => changeLanguage('zh')}>中文</button>
            </div>
          )}
        </div>
      </div>

      {coordinateMode !== 'none' && (
        <div className="coordinate-notice">
          {t('message.coordinateSetMode')}
        </div>
      )}

      <div className="section">
        <div className="row">
          <label>{t('form.topLeft')}</label>
          <span className="coordinate">({topLeft.x}, {topLeft.y})</span>
          <button 
            onClick={handleTopLeftClick} 
            disabled={isCapturing || coordinateMode !== 'none'}
            className={coordinateMode === 'topLeft' ? 'active' : ''}
          >
            {t('form.clickCoordinate')}
          </button>
        </div>

        <div className="row">
          <label>{t('form.bottomRight')}</label>
          <span className="coordinate">({bottomRight.x}, {bottomRight.y})</span>
          <button 
            onClick={handleBottomRightClick} 
            disabled={isCapturing || coordinateMode !== 'none'}
            className={coordinateMode === 'bottomRight' ? 'active' : ''}
          >
            {t('form.clickCoordinate')}
          </button>
        </div>

        <div className="row">
          <label>{t('form.totalPages')}</label>
          <input
            type="number"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder={t('form.totalPagesPlaceholder')}
            disabled={isCapturing}
          />
        </div>

        <div className="row">
          <label>{t('form.pdfName')}</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder={t('form.pdfNamePlaceholder')}
            disabled={isCapturing}
          />
        </div>

        <div className="row">
          <label>{t('form.captureSpeed')}</label>
          <input
            type="number"
            value={captureSpeed}
            onChange={(e) => setCaptureSpeed(e.target.value)}
            placeholder={t('form.captureSpeedPlaceholder')}
            min="500"
            max="5000"
            disabled={isCapturing}
          />
        </div>
      </div>

      {progress.status !== 'idle' && (
        <div className="status">
          <div className="status-message">{progress.message}</div>
          {progress.total > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="button-group">
        <button
          className="reset-button"
          onClick={handleReset}
          disabled={isCapturing}
        >
          {t('form.reset')}
        </button>
        <button
          className="main-button"
          onClick={handleStartCapture}
          disabled={isCapturing}
        >
          {t('form.createPDF')}
        </button>
      </div>

      <div className="signature">{t('app.madeBy')}</div>
    </div>
  );
};
