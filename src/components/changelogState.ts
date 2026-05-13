export const MOBILE_CHANGELOG_QUERY = "(max-width: 840px)";

export function shouldOpenChangelogByDefault(matchesMobile: boolean): boolean {
  return !matchesMobile;
}

export function getInitialChangelogOpenState(matchMedia: Pick<Window, "matchMedia">["matchMedia"] | undefined): boolean {
  if (!matchMedia) {
    return true;
  }

  return shouldOpenChangelogByDefault(matchMedia(MOBILE_CHANGELOG_QUERY).matches);
}
