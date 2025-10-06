import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Point, CaptureProgress, DEFAULT_CAPTURE_SPEED } from '../types';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [topLeft, setTopLeft] = useState<Point>({ x: 0, y: 0 });
  const [bottomRight, setBottomRight] = useState<Point>({ x: 0, y: 0 });
  const [totalPages, setTotalPages] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [savePath, setSavePath] = useState<string>('');
  const [defaultDownloadPath, setDefaultDownloadPath] = useState<string>('');
  const [captureSpeed, setCaptureSpeed] = useState<string>(String(DEFAULT_CAPTURE_SPEED));
  const [progress, setProgress] = useState<CaptureProgress>({
    current: 0,
    total: 0,
    status: 'idle'
  });
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);

  useEffect(() => {
    window.electronAPI.onCaptureProgress((progressData) => {
      setProgress(progressData);
    });
    
    // 기본 다운로드 폴더 경로 가져오기
    const getDefaultPath = async () => {
      const path = await window.electronAPI.getDefaultDownloadPath();
      setDefaultDownloadPath(path);
    };
    getDefaultPath();
  }, []);

  const handleTopLeftClick = async (): Promise<void> => {
    const position = await window.electronAPI.getCursorPosition(i18n.language);
    setTopLeft(position);
  };

  const handleBottomRightClick = async (): Promise<void> => {
    const position = await window.electronAPI.getCursorPosition(i18n.language);
    setBottomRight(position);
  };

  const handleSelectSavePath = async (): Promise<void> => {
    const path = await window.electronAPI.selectSavePath();
    if (path) {
      setSavePath(path);
    }
  };

  const handleStartCapture = async (): Promise<void> => {
    // 무조건 맨 먼저 권한 체크 (필드 상관없이)
    const hasPermission = await window.electronAPI.checkPermissions(i18n.language);
    if (!hasPermission) {
      // 권한 없으면 화면에 에러 표시하고 종료
      return;
    }

    // 권한 있으면 이제 필드 검증
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
    if (isNaN(speed) || speed < 50 || speed > 5000) {
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

    // 모든 검증 통과, 실제 캡처 시작
    try {
      await window.electronAPI.startCapture({
        topLeft,
        bottomRight,
        totalPages: pages,
        fileName,
        captureSpeed: speed,
        savePath: savePath || undefined,
        language: i18n.language
      });
    } catch (error) {
      console.error('Capture error:', error);
    }
  };

  const handleReset = async (): Promise<void> => {
    setTopLeft({ x: 0, y: 0 });
    setBottomRight({ x: 0, y: 0 });
    setTotalPages('');
    setFileName('');
    setSavePath('');
    setCaptureSpeed(String(DEFAULT_CAPTURE_SPEED));
    setProgress({ current: 0, total: 0, status: 'idle' });
    await window.electronAPI.reset();
  };

  const handleRefreshPermission = async (): Promise<void> => {
    try {
      const hasPermission = await window.electronAPI.checkPermissions(i18n.language);
      
      if (hasPermission) {
        alert('권한이 확인되었습니다!');
        setProgress({ current: 0, total: 0, status: 'idle' });
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const changeLanguage = (lang: string): void => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
    
    if (progress.status === 'error' && progress.commands) {
      window.electronAPI.checkPermissions(lang).catch(() => {});
    }
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

  const renderMessage = () => {
    if (!progress.message) return null;
    
    const lines = progress.message.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      // 2번 줄이면 무조건 두 버튼 다 표시
      if (line.includes('2.') && progress.commands) {
        elements.push(
          <React.Fragment key={`line-${index}`}>
            {line}
            <br />
            <div className="command-container" style={{ marginTop: '5px', marginBottom: '5px' }}>
              <code className="command-text">{progress.commands.screenRecording}</code>
              <button 
                className="copy-command-button"
                onClick={() => {
                  navigator.clipboard.writeText(progress.commands!.screenRecording);
                  alert('명령어가 클립보드에 복사되었습니다!\n터미널에 붙여넣기 후 실행하세요.');
                }}
              >
                copy
              </button>
            </div>
            <div className="command-container" style={{ marginTop: '5px', marginBottom: '5px' }}>
              <code className="command-text">{progress.commands.accessibility}</code>
              <button 
                className="copy-command-button"
                onClick={() => {
                  navigator.clipboard.writeText(progress.commands!.accessibility);
                  alert('명령어가 클립보드에 복사되었습니다!\n터미널에 붙여넣기 후 실행하세요.');
                }}
              >
                copy
              </button>
            </div>
          </React.Fragment>
        );
      } else if (line.includes('4.') && progress.commands) {
        elements.push(
          <React.Fragment key={`line-${index}`}>
            {line}
            <br />
            <button
              className="open-folder-button-small"
              onClick={() => window.electronAPI.openCurrentFolder()}
              style={{ marginLeft: '20px', marginTop: '5px', marginBottom: '5px' }}
            >
              {t('form.openFolder') || 'Open App Location'}
            </button>
            <br />
          </React.Fragment>
        );
      } else {
        elements.push(<React.Fragment key={`line-${index}`}>{line}<br /></React.Fragment>);
      }
    });
    
    // 맨 마지막에 권한 새로고침 버튼 추가
    if (progress.commands) {
      elements.push(
        <React.Fragment key="refresh-permission">
          <button
            className="refresh-permission-button-small"
            onClick={handleRefreshPermission}
          >
            {t('form.refreshPermission') || 'Refresh Permission'}
          </button>
        </React.Fragment>
      );
    }
    
    return <>{elements}</>;
  };

  const isCapturing = progress.status === 'capturing' || progress.status === 'converting';

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <img src="icon.png" alt="App Icon" className="app-icon" />
        </div>
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

      <div className="section">
        <div className="row">
          <label>{t('form.topLeft')}</label>
          <span className="coordinate">({topLeft.x}, {topLeft.y})</span>
          <button 
            onClick={handleTopLeftClick} 
            disabled={isCapturing}
          >
            {t('form.clickCoordinate')}
          </button>
        </div>

        <div className="row">
          <label>{t('form.bottomRight')}</label>
          <span className="coordinate">({bottomRight.x}, {bottomRight.y})</span>
          <button 
            onClick={handleBottomRightClick} 
            disabled={isCapturing}
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
          <label>{t('form.savePath')}</label>
          <input
            type="text"
            value={savePath || `(${t('form.defaultPath')}: ${defaultDownloadPath})`}
            placeholder={t('form.savePathPlaceholder')}
            disabled
            className="path-input"
          />
          <button 
            onClick={handleSelectSavePath}
            disabled={isCapturing}
          >
            {t('form.browse')}
          </button>
        </div>

        <div className="row">
          <label>{t('form.captureSpeed')}</label>
          <input
            type="number"
            value={captureSpeed}
            onChange={(e) => setCaptureSpeed(e.target.value)}
            placeholder={t('form.captureSpeedPlaceholder')}
            min="50"
            max="5000"
            disabled={isCapturing}
          />
        </div>
      </div>

      {progress.status !== 'idle' && (
        <div className="status">
          <div className="status-message">
            {renderMessage()}
          </div>
          {progress.total > 0 && progress.status !== 'error' && (
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

      <div className="info-box">
        <div className="info-text">
          {t('form.captureInfo')}
        </div>
      </div>

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
