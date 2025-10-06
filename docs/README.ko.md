# E-Book to PDF 변환기
[English](README.md) | [日本語](docs/README.ja.md) | [中文](docs/README.zh.md)

E-Book 뷰어에서 자동으로 페이지를 캡처하여 PDF로 변환하는 데스크톱 애플리케이션입니다.

## 주요 기능
- 화면 영역 자동 캡처
- 자동 페이지 넘김 (오른쪽 화살표 키 또는 엔터 키)
- PDF 변환
- 캡처 속도 조절
- 실시간 진행상황 표시
- 멀티 플랫폼 지원 (macOS, Windows)
- 다국어 지원 (한국어, 영어, 일본어, 중국어)

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

## 실행 방법

### 개발용
```bash
# 빌드
npm run build

# 실행
npm start
```

### 완성본
```bash
# 추후 업데이트 예정
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
6. 저장 위치 선택 (선택 사항, 기본값: 다운로드 폴더)
7. 캡처 속도 조절 (기본값: 500ms)
8. "PDF로 만들기" 버튼 클릭
9. 앱이 최소화되면 캡처할 앱 클릭 (3초 대기 후 1초 뒤 자동 시작)

## 사용 시 유의사항
- E-Book 뷰어가 키보드 오른쪽 방향키 또는 엔터 키로 페이지 전환이 되어야 합니다
- 캡처 영역이 뷰어 영역을 벗어나면 안됩니다
- 페이지 수가 많을 경우 시간이 오래 걸릴 수 있습니다
- 캡처 중에는 다른 작업을 하지 마세요
- 개인 사용 목적으로만 사용하세요
- 캡처 완료 시 PDF가 저장된 폴더가 자동으로 열립니다

## 시스템 요구사항

### macOS
- macOS 10.14 이상
- 화면 녹화 권한 필요
- 접근성 권한 필요 (키보드 입력용)

### Windows
- Windows 10 이상
- PowerShell 5.0 이상

## 법적 고지
이 프로그램은 개인 학습 및 사용 목적으로 제작되었습니다.
생성된 PDF 파일을 타인과 공유하거나 상업적으로 사용하는 것은 저작권법 위반입니다.
이에 대한 모든 책임은 사용자에게 있습니다.

## 라이선스
Apache 2.0

Copyright 2025 efforthye

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## 기여하기
기여는 언제나 환영합니다! Pull Request를 자유롭게 제출해주세요.
