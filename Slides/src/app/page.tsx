"use client";

import type { ComponentType, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BusinessModel } from "@/Slides/BusinessModel";
import { GoToMarket } from "@/Slides/GoToMarket";
import { Market } from "@/Slides/Market";
import { Problem } from "@/Slides/Problem";
import { Solution } from "@/Slides/Solution";
import { Team } from "@/Slides/Team";
import { WhyNow } from "@/Slides/WhyNow";

const slideWidth = 1366;
const slideHeight = 768;

type SlideDefinition = {
  Component: ComponentType;
  label: string;
  title: string;
};

const slides: SlideDefinition[] = [
  { Component: Problem, label: "01", title: "Problem" },
  { Component: Solution, label: "02", title: "Solution" },
  { Component: WhyNow, label: "03", title: "How It Works" },
  { Component: Market, label: "04", title: "Market" },
  { Component: BusinessModel, label: "05", title: "Business Model" },
  { Component: GoToMarket, label: "06", title: "Go To Market" },
  { Component: Team, label: "07", title: "Why Us" },
];

type SlideStageProps = {
  children: ReactNode;
  isPresenting: boolean;
};

function SlideStage({ children, isPresenting }: SlideStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateScale = () => {
      const nextScale = Math.min(
        container.clientWidth / slideWidth,
        container.clientHeight / slideHeight,
        1,
      );

      setScale(Math.max(nextScale, 0));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={
        isPresenting
          ? "grid h-dvh w-dvw place-items-center overflow-hidden"
          : "grid h-full min-h-0 w-full place-items-center overflow-hidden"
      }
      ref={containerRef}
    >
      <div
        style={{
          height: slideHeight * scale,
          width: slideWidth * scale,
        }}
      >
        <div
          style={{
            height: slideHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: slideWidth,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const CurrentSlide = slides[currentIndex]?.Component ?? Problem;
  const previous = currentIndex > 0;
  const next = currentIndex < slides.length - 1;

  const navigateToIndex = useCallback((index: number) => {
    setCurrentIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }, []);

  const goToPrevious = useCallback(() => {
    navigateToIndex(currentIndex - 1);
  }, [currentIndex, navigateToIndex]);

  const goToNext = useCallback(() => {
    navigateToIndex(currentIndex + 1);
  }, [currentIndex, navigateToIndex]);

  const enterPresentation = useCallback(() => {
    setIsPresenting(true);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, []);

  const exitPresentation = useCallback(() => {
    setIsPresenting(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }, []);

  const exportPdf = useCallback(() => {
    setIsPresenting(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }

    window.requestAnimationFrame(() => {
      window.print();
    });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");

      if (isEditable) {
        return;
      }

      if (
        event.key === "ArrowRight" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        goToNext();
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToPrevious();
      }

      if (event.key === "Home") {
        event.preventDefault();
        navigateToIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        navigateToIndex(slides.length - 1);
      }

      if (event.key === "Escape" && isPresenting) {
        event.preventDefault();
        exitPresentation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [exitPresentation, goToNext, goToPrevious, isPresenting, navigateToIndex]);

  const printDeck = useMemo(
    () => (
      <div className="print-deck" aria-label="Printable slide deck">
        {slides.map((slide) => {
          const Slide = slide.Component;
          return (
            <div className="print-slide-page" key={slide.label}>
              <Slide />
            </div>
          );
        })}
      </div>
    ),
    [],
  );

  return (
    <main
      className={
        isPresenting
          ? "grid min-h-dvh place-items-center overflow-hidden bg-slate-950 text-slate-900"
          : "min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(36,87,255,0.15),transparent_34%),radial-gradient(circle_at_82%_76%,rgba(32,178,107,0.14),transparent_30%),radial-gradient(circle_at_70%_18%,rgba(245,165,36,0.13),transparent_28%),#eef2f5] p-3 text-slate-900 md:p-6"
      }
    >
      {printDeck}
      {isPresenting ? (
        <>
          <SlideStage isPresenting={isPresenting}>
            <CurrentSlide />
          </SlideStage>
          <button
            className="fixed right-4 top-4 z-50 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-white/18"
            onClick={exitPresentation}
            type="button"
          >
            Exit
          </button>
        </>
      ) : (
        <div className="mx-auto grid h-[calc(100dvh-24px)] w-full max-w-[1558px] grid-cols-[minmax(0,1fr)_168px] gap-3 md:h-[calc(100dvh-48px)] md:gap-5">
          <div className="h-full min-h-0 overflow-hidden">
            <SlideStage isPresenting={isPresenting}>
              <CurrentSlide />
            </SlideStage>
          </div>

          <aside className="flex h-full min-w-0 flex-col justify-between gap-3 rounded-lg border border-slate-950/10 bg-white/80 p-3 shadow-[0_18px_50px_rgba(16,20,24,0.1)] backdrop-blur-xl">
            <nav className="grid grid-cols-1 gap-2" aria-label="Slides">
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;

                return (
                  <button
                    className={[
                      "rounded-md border px-3 py-2.5 text-left transition",
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-600/30 hover:bg-blue-50 hover:text-slate-950",
                    ].join(" ")}
                    key={slide.label}
                    onClick={() => navigateToIndex(index)}
                    type="button"
                  >
                    <div className="font-mono text-[11px] font-black">
                      {slide.label}
                    </div>
                    <div className="mt-1 text-sm font-extrabold leading-tight">
                      {slide.title}
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="grid gap-2">
              <div className="text-center font-mono text-xs font-bold text-slate-400">
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </div>
              <button
                aria-pressed={isPresenting}
                className="h-10 rounded-md bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-slate-800"
                onClick={enterPresentation}
                type="button"
              >
                Present
              </button>
              <button
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 transition hover:border-blue-600/30 hover:bg-blue-50"
                onClick={exportPdf}
                type="button"
              >
                Export PDF
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="grid h-10 place-items-center rounded-md border border-slate-200 bg-slate-100 text-lg font-black text-slate-800 disabled:opacity-35"
                  disabled={!previous}
                  onClick={goToPrevious}
                  type="button"
                >
                  ←
                </button>
                <button
                  className="grid h-10 place-items-center rounded-md bg-blue-600 text-lg font-black text-white disabled:opacity-35"
                  disabled={!next}
                  onClick={goToNext}
                  type="button"
                >
                  →
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
