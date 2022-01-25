@echo on
@cd /D "%~dp0"
@echo ""
@echo %~dp0

@if "%1" == "install" (
    @echo "argument install"
    @goto :npmInstall
)
@if NOT EXIST node_modules. (
    @echo "node_modules not found"
    @goto :npmInstall
)
@goto :npmInstallDone

:npmInstall
npm install

:npmInstallDone

@echo compile
call npx tsc --noEmit
@IF ERRORLEVEL 1 goto :EOF

@echo jest
call npx jest
@IF ERRORLEVEL 1 goto :EOF

:fini
@echo -fini-