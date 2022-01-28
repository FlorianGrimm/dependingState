call "%~dp0\dependingState\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\dependingStateRouter\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\SampleTimer\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\SampleLog\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\sample\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\sampleprocessdirty\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\sampleRouter\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\sampleSimple\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\SampleStateVersion\build.bat"
@IF ERRORLEVEL 1 goto :Failed

call "%~dp0\sampleStyle\build.bat"
@IF ERRORLEVEL 1 goto :Failed

goto :EOF
@echo OK

:Failed
@echo Failed
