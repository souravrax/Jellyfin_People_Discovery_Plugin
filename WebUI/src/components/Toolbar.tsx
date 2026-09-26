import React from "react";
import { FILTERS } from "../constants.js";

interface ToolbarProps {
  title: string;
  range: string;
  filterActive: boolean;
  menuOpen: boolean;
  personType: string;
  prevDisabled: boolean;
  nextDisabled: boolean;
  onTitleClick: (e: React.MouseEvent) => void;
  onType: (value: string) => void;
  onToggleFilter: () => void;
  onToggleSort: () => void;
  onToggleView: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function ActionButton({
  title,
  act,
  disabled,
  onClick,
  children,
  first,
  last,
}: {
  title: string;
  act?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  first?: boolean;
  last?: boolean;
}) {
  const pos = first
    ? "MuiButtonGroup-firstButton"
    : last
      ? "MuiButtonGroup-lastButton"
      : "MuiButtonGroup-middleButton";
  return (
    <button
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-[#e8e8e8] hover:bg-white/10 hover:text-white disabled:opacity-30 MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit ${pos} css-1f20jcn`}
      type="button"
      title={title}
      data-act={act}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Movies-style toolbar: title menu, count chip, filter/sort/view + prev/next. */
export function Toolbar(props: ToolbarProps) {
  const {
    title, range, filterActive, menuOpen, personType,
    prevDisabled, nextDisabled,
    onTitleClick, onType, onToggleFilter, onToggleSort, onToggleView, onPrev, onNext,
  } = props;
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center gap-3.5 bg-[rgba(20,20,20,.96)] border-b border-white/10 px-4 py-2.5 MuiToolbar-root MuiToolbar-gutters MuiToolbar-dense padded-left padded-right css-133e01t" data-toolbar="">
      <button
        className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[1.55rem] font-extrabold tracking-wide text-white hover:bg-white/10 max-md:text-xl MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeLarge MuiButton-textSizeLarge MuiButton-colorInherit css-iqm7ky"
        type="button" aria-controls="jf-people-type-menu" aria-haspopup="true"
        data-titlebtn="" onClick={onTitleClick}
      >
        <span className="MuiTypography-root MuiTypography-h2 css-rtsren" data-titlelabel="">
          {title}
        </span>
        <span className="MuiButton-icon MuiButton-endIcon MuiButton-iconSizeLarge css-19oo937">
          <svg className="h-6 w-6 fill-netflix MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowDropDownIcon">
            <path d="m7 10 5 5 5-5z"></path>
          </svg>
        </span>
      </button>
      <div className="MuiBox-root css-179zilw">
        <div className="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorDefault MuiChip-filledDefault css-1so75cn">
          <span className="inline-block whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#ddd] MuiChip-label MuiChip-labelMedium css-14vsv3w" data-range="">
            {range}
          </span>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-3.5 MuiStack-root css-174l32b">
        <div role="group" className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5 MuiButtonGroup-root MuiButtonGroup-text MuiButtonGroup-horizontal MuiButtonGroup-colorInherit css-boo9v6">
          <ActionButton title="Filter" act="filter" first onClick={onToggleFilter}>
            <span className="MuiBadge-root css-chz7cr">
              <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FilterAltIcon">
                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61"></path>
              </svg>
              <span className={`ml-0.5 h-2 w-2 rounded-full bg-netflix MuiBadge-badge MuiBadge-dot MuiBadge-anchorOriginTopRight MuiBadge-overlapRectangular MuiBadge-colorInfo css-1umg760${filterActive ? "" : " MuiBadge-invisible"}`} data-filterdot=""></span>
            </span>
          </ActionButton>
          <ActionButton title="Sort" act="sort" onClick={onToggleSort}>
            <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SortByAlphaIcon">
              <path d="M14.94 4.66h-4.72l2.36-2.36zm-4.69 14.71h4.66l-2.33 2.33zM6.1 6.27 1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27zm-1.13 7.37 1.94-5.18 1.94 5.18zm10.76 2.5h6.12v1.59h-8.53v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26z"></path>
            </svg>
          </ActionButton>
          <ActionButton title="View settings" act="view" last onClick={onToggleView}>
            <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ViewModuleIcon">
              <path d="M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"></path>
            </svg>
          </ActionButton>
        </div>
        <div role="group" className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5 MuiButtonGroup-root MuiButtonGroup-text MuiButtonGroup-horizontal MuiButtonGroup-colorInherit css-boo9v6">
          <ActionButton title="Previous" act="prev" first disabled={prevDisabled} onClick={onPrev}>
            <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NavigateBeforeIcon">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </ActionButton>
          <ActionButton title="Next" act="next" last disabled={nextDisabled} onClick={onNext}>
            <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NavigateNextIcon">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
          </ActionButton>
        </div>
      </div>
      <div className="absolute left-4 top-[calc(100%+.3rem)] z-[1300] min-w-52 rounded-xl border border-white/10 bg-[#1f1f1f] p-1.5 shadow-2xl MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation8 css-1l7bsgz" id="jf-people-type-menu" data-typemenu="" hidden={!menuOpen}>
        {FILTERS.map((f) => (
          <button key={f.label} type="button" role="menuitem" data-value={f.value} data-on={String(f.value === personType)} onClick={() => onType(f.value)}
            className="flex w-full rounded-md px-3 py-2.5 text-left text-sm text-[#eee] hover:bg-white/10 data-[on=true]:bg-netflix/20 data-[on=true]:font-bold">
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
