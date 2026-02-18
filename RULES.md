# 개발 규칙 (RULES)

## 코딩 스타일: 함수형 프로그래밍 (1~3년차 기준)

### 1. 함수형 원칙
- **순수 함수 우선**: 같은 입력 → 같은 출력, 사이드이펙트 최소화
- **불변성**: 상태 직접 변경 금지, 항상 새 객체/배열 반환
- **합성**: 작은 함수를 조합하여 큰 기능 구현
- **선언적 코드**: "어떻게" 보다 "무엇을" 에 집중

### 2. TypeScript 규칙
- `any` 사용 금지 → 명확한 타입 정의
- `interface` 우선 사용 (type은 유니온/교차 타입에만)
- `const` 우선, `let` 최소화, `var` 금지
- Optional chaining (`?.`) 적극 활용
- Nullish coalescing (`??`) 사용

### 3. React 규칙
- **함수형 컴포넌트만** 사용 (class 컴포넌트 금지)
- **커스텀 훅**으로 로직 분리
- `useCallback`, `useMemo` 적절히 활용
- Props drilling 3단계 이상 → Zustand store 사용
- 컴포넌트는 단일 책임 원칙

### 4. 상태 관리
- **Zustand** 사용 (전역 상태)
- **useState** (컴포넌트 로컬 상태)
- 상태 업데이트는 항상 **immer 패턴** 또는 **스프레드 연산자**

### 5. 파일/폴더 구조
```
src/
├── data/           # 순수 데이터 (상수, 설정값)
├── types/          # 타입 정의
├── systems/        # 게임 로직 (순수 함수)
├── store/          # Zustand 스토어
├── components/     # React 컴포넌트 (UI)
├── canvas/         # Canvas 렌더링 로직
├── hooks/          # 커스텀 훅
├── utils/          # 유틸리티 함수
├── App.tsx
└── main.tsx
```

### 6. 네이밍 규칙
- **파일명**: camelCase (시스템), PascalCase (컴포넌트)
- **함수**: camelCase, 동사로 시작 (`getCards`, `calculateDamage`)
- **상수**: UPPER_SNAKE_CASE (`MAX_DECK_SIZE`)
- **타입/인터페이스**: PascalCase (`CardData`, `BattleState`)
- **컴포넌트**: PascalCase (`MainMenu`, `BattleScreen`)

### 7. 함수 작성 규칙
- 한 함수는 **20줄 이내** 권장
- 매개변수 **3개 이하** (초과 시 객체로 묶기)
- 중첩 **2단계 이하** (깊으면 함수 분리)
- `map`, `filter`, `reduce` 적극 활용 (for문 최소화)
- 조기 반환(early return) 패턴 사용

### 8. 주석 규칙
- 함수 위에 **JSDoc** 스타일 주석
- "왜" 를 설명 ("무엇"은 코드가 설명)
- TODO 주석은 `// TODO:` 형식

### 9. 테스트
- 순수 함수는 단위 테스트 작성
- 게임 로직 (systems/) 우선 테스트

### 10. Git 커밋
- 기능 단위 커밋
- 한글 커밋 메시지 OK
- 형식: `[카테고리] 설명` (예: `[전투] 마나 시스템 구현`)
