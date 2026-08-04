/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/slider-destinations/route";
exports.ids = ["app/api/slider-destinations/route"];
exports.modules = {

/***/ "(rsc)/./app/api/slider-destinations/route.ts":
/*!**********************************************!*\
  !*** ./app/api/slider-destinations/route.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PUT: () => (/* binding */ PUT),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst runtime = \"nodejs\";\nconst filePath = ()=>path__WEBPACK_IMPORTED_MODULE_2___default().join(process.cwd(), \"public\", \"slider-destinations.json\");\nasync function GET() {\n    try {\n        const txt = await fs__WEBPACK_IMPORTED_MODULE_1__.promises.readFile(filePath(), \"utf-8\");\n        const json = JSON.parse(txt);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(json);\n    } catch  {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({}, {\n            status: 200\n        });\n    }\n}\nasync function PUT(req) {\n    try {\n        const body = await req.json();\n        await fs__WEBPACK_IMPORTED_MODULE_1__.promises.mkdir(path__WEBPACK_IMPORTED_MODULE_2___default().dirname(filePath()), {\n            recursive: true\n        });\n        await fs__WEBPACK_IMPORTED_MODULE_1__.promises.writeFile(filePath(), JSON.stringify(body || {}, null, 2), \"utf-8\");\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            ok: true\n        });\n    } catch (e) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            ok: false,\n            message: String(e?.message || e)\n        }, {\n            status: 400\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NsaWRlci1kZXN0aW5hdGlvbnMvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBMkM7QUFDUDtBQUNaO0FBRWpCLE1BQU1JLFVBQVUsU0FBUztBQUVoQyxNQUFNQyxXQUFXLElBQU1GLGdEQUFTLENBQUNJLFFBQVFDLEdBQUcsSUFBSSxVQUFVO0FBRW5ELGVBQWVDO0lBQ3BCLElBQUk7UUFDRixNQUFNQyxNQUFNLE1BQU1SLHdDQUFFQSxDQUFDUyxRQUFRLENBQUNOLFlBQVk7UUFDMUMsTUFBTU8sT0FBT0MsS0FBS0MsS0FBSyxDQUFDSjtRQUN4QixPQUFPVixxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDQTtJQUMzQixFQUFFLE9BQU07UUFDTixPQUFPWixxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDLENBQUMsR0FBRztZQUFFRyxRQUFRO1FBQUk7SUFDN0M7QUFDRjtBQUVPLGVBQWVDLElBQUlDLEdBQVk7SUFDcEMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsSUFBSUwsSUFBSTtRQUMzQixNQUFNVix3Q0FBRUEsQ0FBQ2lCLEtBQUssQ0FBQ2hCLG1EQUFZLENBQUNFLGFBQWE7WUFBRWdCLFdBQVc7UUFBSztRQUMzRCxNQUFNbkIsd0NBQUVBLENBQUNvQixTQUFTLENBQUNqQixZQUFZUSxLQUFLVSxTQUFTLENBQUNMLFFBQVEsQ0FBQyxHQUFHLE1BQU0sSUFBSTtRQUNwRSxPQUFPbEIscURBQVlBLENBQUNZLElBQUksQ0FBQztZQUFFWSxJQUFJO1FBQUs7SUFDdEMsRUFBRSxPQUFPQyxHQUFRO1FBQ2YsT0FBT3pCLHFEQUFZQSxDQUFDWSxJQUFJLENBQUM7WUFBRVksSUFBSTtZQUFPRSxTQUFTQyxPQUFPRixHQUFHQyxXQUFXRDtRQUFHLEdBQUc7WUFBRVYsUUFBUTtRQUFJO0lBQzFGO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQ8Opc2FyXFxEZXNrdG9wXFxjaGlsZS1hZGljdG8taG90ZWxlc1xcYXBwXFxhcGlcXHNsaWRlci1kZXN0aW5hdGlvbnNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5pbXBvcnQgeyBwcm9taXNlcyBhcyBmcyB9IGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJ1bnRpbWUgPSBcIm5vZGVqc1wiO1xyXG5cclxuY29uc3QgZmlsZVBhdGggPSAoKSA9PiBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgXCJwdWJsaWNcIiwgXCJzbGlkZXItZGVzdGluYXRpb25zLmpzb25cIik7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eHQgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCgpLCBcInV0Zi04XCIpO1xyXG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UodHh0KTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihqc29uKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7fSwgeyBzdGF0dXM6IDIwMCB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQVVQocmVxOiBSZXF1ZXN0KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpO1xyXG4gICAgYXdhaXQgZnMubWtkaXIocGF0aC5kaXJuYW1lKGZpbGVQYXRoKCkpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShmaWxlUGF0aCgpLCBKU09OLnN0cmluZ2lmeShib2R5IHx8IHt9LCBudWxsLCAyKSwgXCJ1dGYtOFwiKTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG9rOiB0cnVlIH0pO1xyXG4gIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgb2s6IGZhbHNlLCBtZXNzYWdlOiBTdHJpbmcoZT8ubWVzc2FnZSB8fCBlKSB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwicHJvbWlzZXMiLCJmcyIsInBhdGgiLCJydW50aW1lIiwiZmlsZVBhdGgiLCJqb2luIiwicHJvY2VzcyIsImN3ZCIsIkdFVCIsInR4dCIsInJlYWRGaWxlIiwianNvbiIsIkpTT04iLCJwYXJzZSIsInN0YXR1cyIsIlBVVCIsInJlcSIsImJvZHkiLCJta2RpciIsImRpcm5hbWUiLCJyZWN1cnNpdmUiLCJ3cml0ZUZpbGUiLCJzdHJpbmdpZnkiLCJvayIsImUiLCJtZXNzYWdlIiwiU3RyaW5nIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/slider-destinations/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fslider-destinations%2Froute&page=%2Fapi%2Fslider-destinations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fslider-destinations%2Froute.ts&appDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fslider-destinations%2Froute&page=%2Fapi%2Fslider-destinations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fslider-destinations%2Froute.ts&appDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_C_sar_Desktop_chile_adicto_hoteles_app_api_slider_destinations_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/slider-destinations/route.ts */ \"(rsc)/./app/api/slider-destinations/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/slider-destinations/route\",\n        pathname: \"/api/slider-destinations\",\n        filename: \"route\",\n        bundlePath: \"app/api/slider-destinations/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\César\\\\Desktop\\\\chile-adicto-hoteles\\\\app\\\\api\\\\slider-destinations\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_C_sar_Desktop_chile_adicto_hoteles_app_api_slider_destinations_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZzbGlkZXItZGVzdGluYXRpb25zJTJGcm91dGUmcGFnZT0lMkZhcGklMkZzbGlkZXItZGVzdGluYXRpb25zJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2xpZGVyLWRlc3RpbmF0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNDJUMzJUE5c2FyJTVDRGVza3RvcCU1Q2NoaWxlLWFkaWN0by1ob3RlbGVzJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNDJUMzJUE5c2FyJTVDRGVza3RvcCU1Q2NoaWxlLWFkaWN0by1ob3RlbGVzJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUN3QztBQUNySDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcQ8Opc2FyXFxcXERlc2t0b3BcXFxcY2hpbGUtYWRpY3RvLWhvdGVsZXNcXFxcYXBwXFxcXGFwaVxcXFxzbGlkZXItZGVzdGluYXRpb25zXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9zbGlkZXItZGVzdGluYXRpb25zL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvc2xpZGVyLWRlc3RpbmF0aW9uc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2xpZGVyLWRlc3RpbmF0aW9ucy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXEPDqXNhclxcXFxEZXNrdG9wXFxcXGNoaWxlLWFkaWN0by1ob3RlbGVzXFxcXGFwcFxcXFxhcGlcXFxcc2xpZGVyLWRlc3RpbmF0aW9uc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fslider-destinations%2Froute&page=%2Fapi%2Fslider-destinations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fslider-destinations%2Froute.ts&appDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fslider-destinations%2Froute&page=%2Fapi%2Fslider-destinations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fslider-destinations%2Froute.ts&appDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CC%C3%A9sar%5CDesktop%5Cchile-adicto-hoteles&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();