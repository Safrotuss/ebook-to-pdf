# E-Book to PDF 변환기
[English](README.md) | [日本語](docs/README.ja.md) | [中文](docs/README.zh.md)

E-Book 뷰어에서 자동으로 페이지를 캡처하여 PDF로 변환하는 데스크톱 애플리케이션입니다.

## 주요 기능
- 화면 영역 자동 캡처
- 자동 페이지 넘김
- PDF 변환
- 캡처 속도 조절
- 실시간 진행상황 표시
- 멀티 플랫폼 지원 (macOS, Windows)

## 기술 스택
- Electron
- React
- TypeScript
- Sharp (이미지 처리)
- PDFKit (PDF 생성)

## 설치 방법
```bash
npm install
```

## 개발 모드 실행
```bash
npm run dev
npx electron .
```

터미널
```bash
npm start
```

## 빌드

### macOS & Windows 동시 빌드
```bash
npm run package
```

### macOS만 빌드
```bash
npm run package:mac
```

### Windows만 빌드
```bash
npm run package:win
```

빌드된 파일은 `release` 폴더에 생성됩니다.

## 사용 방법
1. E-Book 뷰어를 실행하고 첫 페이지로 이동
2. 캡처할 영역의 좌측 상단 좌표 클릭
3. 캡처할 영역의 우측 하단 좌표 클릭
4. 총 페이지 수 입력
5. PDF 파일 이름 입력
6. 캡처 속도 조절 (기본값: 1000ms)
7. "PDF로 만들기" 버튼 클릭

## 사용 시 유의사항
- E-Book 뷰어가 키보드 오른쪽 방향키로 페이지 전환이 되어야 합니다
- 캡처 영역이 뷰어 영역을 벗어나면 안됩니다
- 페이지 수가 많을 경우 시간이 오래 걸릴 수 있습니다
- 캡처 중에는 다른 작업을 하지 마세요
- 개인 사용 목적으로만 사용하세요

## 시스템 요구사항

### macOS
- macOS 10.14 이상
- 화면 녹화 권한 필요

### Windows
- Windows 10 이상
- PowerShell 5.0 이상

## 법적 고지
이 프로그램은 개인 학습 및 사용 목적으로 제작되었습니다.
생성된 PDF 파일을 타인과 공유하거나 상업적으로 사용하는 것은 저작권법 위반입니다.
이에 대한 모든 책임은 사용자에게 있습니다.

## 라이선스
Apache License 2.0

## 제작자
Created by efforthye

## 기여하기
기여는 언제나 환영합니다! Pull Request를 자유롭게 제출해주세요.
