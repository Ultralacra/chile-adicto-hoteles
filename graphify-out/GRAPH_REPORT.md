# Graph Report - chile-adicto-hoteles  (2026-08-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1212 nodes · 2456 edges · 131 communities (77 shown, 54 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d134bfd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 70
- Community 71
- Community 72
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128

## God Nodes (most connected - your core abstractions)
1. `cn()` - 272 edges
2. `requireSuperadmin()` - 50 edges
3. `adminAuthResponse()` - 45 edges
4. `getCurrentSiteId()` - 33 edges
5. `useLanguage()` - 30 edges
6. `useSiteApi()` - 24 edges
7. `invalidateServerDataCache()` - 24 edges
8. `useAdminApi()` - 23 edges
9. `scripts` - 22 edges
10. `getCachedServerData()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `SidebarContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sidebar.tsx → lib/utils.ts
- `SidebarFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sidebar.tsx → lib/utils.ts
- `SidebarGroup()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sidebar.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (131 total, 54 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (48): cross-env, dotenv, devDependencies, cross-env, dotenv, @playwright/test, postcss, tailwindcss (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (40): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), Sidebar() (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (30): AccordionContent(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarFallback(), AvatarImage(), Checkbox(), InputOTP() (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (38): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (23): PostsListPage(), envOrNull(), fetchFromSupabase(), fetchWithPublicationFallback(), GET(), mapRowToLegacy(), Pagination(), PaginationContent() (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (26): adminResponseError(), assignmentSchema, dateField, DELETE(), envOrNull(), featuredSchema, GET(), hasServiceRole() (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next-dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (21): filePath(), GET(), PUT(), runtime, envOrNull(), POST(), runtime, tryRegisterInMediaTable() (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (17): BackButton(), BackButtonMobile(), BackButtonProps, LanguageSwitcher(), LanguageSwitcherProps, MobileFooterContent(), MobileFooterContentProps, MobileMenu() (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (26): en, es, AC KITCHEN-1.png, AC KITCHEN-2.png, AMBROSÍA-1.webp, AMBROSÍA-2.webp, BORAGÓ-1.png, BORAGÓ-2.png (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (22): CategorySuggestion, DbSliderItem, DbSliderResp, HomeResp, HrefSuggestionItem, MediaListResp, Carousel(), CarouselApi (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (21): anonRest(), CommuneRow, DELETE(), dynamic, envOrNull(), GET(), normalizeSlug(), POST() (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): EditPostPage(), moveImageFactory(), NewPostPage(), POST(), localizedSchema, PostInput, postSchema, normalizePost() (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (16): Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (14): metadata, montserrat, GATracker(), Window, ScrollRestorationProvider(), ScrollToTop(), LanguageProvider(), useScrollRestoration() (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (20): anonRest(), DELETE(), dynamic, envOrNull(), GET(), POST(), revalidate, runtime (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (15): ApiCommuneRow, ResolvedParams, topRestaurantsSlugs, desktopImagesDefault, HeroSlider(), HeroSliderProps, mobileImagesDefault, BottomHomeBanner() (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (13): AdminCategoriesPage(), CategoryRow, AdminCommunesPage(), CommuneDetail, CommuneRow, PostSearchItem, AdminDashboard(), CategoryRow (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (18): dynamic, GET(), isImage(), PUT(), revalidate, runtime, baseName(), GET() (+10 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (15): CategoryPage(), buildHotelDetailShape(), LugarPage(), ResolvedParams, Page(), Page(), HomeContent(), Header() (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (18): envOrNull(), fetchFromSupabase(), fetchPostsWithPublicationFallback(), GET(), getAlphabeticalSortKey(), getStableSearchParams(), HOME_FEED_EXCLUDED, isExcludedFromHomeFeed() (+10 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (16): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Field(), FieldContent(), FieldDescription(), FieldError() (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.24
Nodes (13): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+5 more)

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (14): ApiCategoryRow, CategoryNav(), CategoryNavProps, fallbackCategories, prettySlugs, buildUrl(), useSiteApi(), cache (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.28
Nodes (15): DELETE(), deleteStorageObject(), encodeStoragePath(), envOrNull(), fetchFromSupabase(), fetchSinglePostBySlugAnySite(), fetchWithPublicationFallback(), GET() (+7 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.24
Nodes (9): HomeCacheEntry, homeFeedCache, Footer(), FooterProps, Header(), BottomHomeBanner(), BottomHomeBannerProps, PromoStackBanners() (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (11): formatInstagramDisplay(), formatMailto(), formatPhoneDisplay(), formatTel(), formatWebsiteDisplay(), formatWebsiteHref(), HotelDetail(), HotelDetailProps (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (13): autoprefixer, dependencies, autoprefixer, @radix-ui/react-accordion, @radix-ui/react-dropdown-menu, @radix-ui/react-hover-card, @radix-ui/react-toggle-group, react-hook-form (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.24
Nodes (8): AdminRichText(), AdminRichTextProps, ALLOWED_TAGS, BLOCK_TAGS, Button(), buttonVariants, Calendar(), CalendarDayButton()

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (12): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (10): AdminImagesPage(), buildImageRecords(), getImageFolder(), getPostName(), ImageRecord, PostLite, Tabs(), TabsContent() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.23
Nodes (8): AdminAuthErrorModal(), SiteLoadingOverlay(), SiteSelector(), SiteContext, SiteContextType, SiteProvider(), SiteId, SITES

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (11): DELETE(), dynamic, envOrNull(), fetchFromSupabase(), GET(), normalizeSlug(), POST(), PUT() (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (11): buildMediaUrlList(), canUseAnon(), canUseService(), clampInt(), envOrNull(), GET(), getMediaName(), MediaListCache (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (9): CategoryBlock(), CategoryResult, displayNames, formatNumber(), hotelName(), HotelResult, OverallRow(), ResultadosContent() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (9): Select(), SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger() (+1 more)

### Community 40 - "Community 40"
Cohesion: 0.23
Nodes (10): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.27
Nodes (8): useCurrentSite(), getSiteByDomain(), isDomainForSite(), SiteConfig, ALLOWED_CORS_ORIGINS, applyCorsHeaders(), config, middleware()

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 44 - "Community 44"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (8): AdminAgendaCulturalPage(), emptyAssignment, emptyFeatured, emptyPeriod, normalizePayload(), Tab, tabMeta, Label()

### Community 46 - "Community 46"
Cohesion: 0.27
Nodes (7): AdminLoginPage(), normalizeSlug(), slugAliases, TopHotel, VerVotosPage(), Vote, supabase

### Community 47 - "Community 47"
Cohesion: 0.31
Nodes (9): canonicalHotelSlug(), GET(), fetchAllPages(), getHeaders(), getReadHeaders(), HOTEL_SLUG_ALIASES, POST(), runtime (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.36
Nodes (7): login(), AuthCredentials, bearer(), getSupabaseAccessToken(), getSupabaseCredentials(), protectedRequests, sensitiveReads

### Community 50 - "Community 50"
Cohesion: 0.44
Nodes (8): canUseAnon(), canUseService(), envOrNull(), GET(), PUT(), runtime, SliderItem, supabaseRest()

### Community 51 - "Community 51"
Cohesion: 0.39
Nodes (7): getOverrideForSlug(), listOverrides(), readMap(), removeOverrideForSlug(), setOverrideForSlug(), SiteId, writeMap()

### Community 52 - "Community 52"
Cohesion: 0.39
Nodes (7): anonRest(), dynamic, envOrNull(), POST(), revalidate, runtime, serviceRest()

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 56 - "Community 56"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 57 - "Community 57"
Cohesion: 0.60
Nodes (5): envOrNull(), POST(), runtime, serviceRest(), uploadToSupabaseStorage()

### Community 58 - "Community 58"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 60 - "Community 60"
Cohesion: 0.40
Nodes (3): AgendaBannerRange, agendaBannerRanges, repeatingSlugDateRanges

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (3): GET(), getHeaders(), runtime

## Knowledge Gaps
- **316 isolated node(s):** `SidebarContextProps`, `CategorySuggestion`, `DbSliderItem`, `DbSliderResp`, `HomeResp` (+311 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 2` to `Community 1`, `Community 3`, `Community 4`, `Community 8`, `Community 10`, `Community 13`, `Community 19`, `Community 21`, `Community 22`, `Community 25`, `Community 27`, `Community 28`, `Community 32`, `Community 33`, `Community 34`, `Community 39`, `Community 40`, `Community 42`, `Community 43`, `Community 44`, `Community 45`, `Community 48`, `Community 54`, `Community 55`, `Community 56`, `Community 58`, `Community 59`, `Community 63`, `Community 65`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `Spinner()` connect `Community 19` to `Community 34`, `Community 2`, `Community 4`, `Community 10`, `Community 13`, `Community 16`, `Community 17`, `Community 22`, `Community 29`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `requireSuperadmin()` connect `Community 7` to `Community 36`, `Community 37`, `Community 5`, `Community 11`, `Community 15`, `Community 18`, `Community 50`, `Community 20`, `Community 57`, `Community 26`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `SidebarContextProps`, `CategorySuggestion`, `DbSliderItem` to the rest of the system?**
  _316 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05673758865248227 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07373737373737374 - nodes in this community are weakly interconnected._