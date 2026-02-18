import { SPRITE_SHEETS, BACKGROUND_LAYERS, GROUND_TILESET, BASE_BUILDING, DECORATIONS } from './spriteConfig';

// ===== 이미지 캐시 =====

const imageCache: Map<string, HTMLImageElement> = new Map();
let preloaded = false;

// ===== 유틸 =====

/** 단일 이미지 로드 (캐시) */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  const cached = imageCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`[SpriteLoader] Failed to load: ${src}`);
      reject(new Error(`Failed to load: ${src}`));
    };
    img.src = src;
  });
};

// ===== 공개 API =====

/** 캐시에서 이미지 가져오기 (없으면 undefined) */
export const getImage = (src: string): HTMLImageElement | undefined =>
  imageCache.get(src);

/** 프리로드 완료 여부 */
export const isPreloaded = (): boolean => preloaded;

/** 모든 게임 에셋 프리로드 */
export const preloadAllSprites = async (): Promise<void> => {
  if (preloaded) return;

  const allPaths: string[] = [];

  // 스프라이트시트
  for (const config of Object.values(SPRITE_SHEETS)) {
    allPaths.push(config.src);
  }

  // Oak Woods 배경
  allPaths.push(...BACKGROUND_LAYERS);

  // 바닥 타일셋
  allPaths.push(GROUND_TILESET);

  // 기지 건물
  allPaths.push(BASE_BUILDING);

  // 장식
  allPaths.push(...Object.values(DECORATIONS));

  // 병렬 로드 (일부 실패해도 나머지 정상)
  const results = await Promise.allSettled(allPaths.map(p => loadImage(p)));

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn(`[SpriteLoader] ${failed.length}/${allPaths.length} assets failed. Falling back to emoji.`);
  } else {
    console.log(`[SpriteLoader] All ${allPaths.length} assets loaded successfully.`);
  }

  preloaded = true;
};
