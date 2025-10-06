import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Point, CaptureProgress, DEFAULT_CAPTURE_SPEED } from '../types';

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

  useEffect(() => {
    window.electronAPI.onCaptureProgress((progressData) => {
      setProgress(progressData);
    });
  }, []);

  const handleTopLeftClick = async (): Promise<void> => {
    const position = await window.electronAPI.getCursorPosition();
    setTopLeft(position);
  };

  const handleBottomRightClick = async (): Promise<void> => {
    const position = await window.electronAPI.getCursorPosition();
    setBottomRight(position);
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
    await window.electronAPI.reset();
  };

  const toggleLanguage = (): void => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
  };

  const isCapturing = progress.status === 'capturing' || progress.status === 'converting';

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">{t('app.title')}</h1>
        <button className="lang-button" onClick={toggleLanguage}>
          {i18n.language === 'ko' ? 'EN' : 'KO'}
        </button>
      </div>

      <div className="section">
        <div className="row">
          <label>{t('form.topLeft')}</label>
          <span className="coordinate">({topLeft.x}, {topLeft.y})</span>
          <button onClick={handleTopLeftClick} disabled={isCapturing}>
            {t('form.clickCoordinate')}
          </button>
        </div>

        <div className="row">
          <label>{t('form.bottomRight')}</label>
          <span className="coordinate">({bottomRight.x}, {bottomRight.y})</span>
          <button onClick={handleBottomRightClick} disabled={isCapturing}>
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
