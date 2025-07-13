@echo off
setlocal

:: Define the output archive name
set "ARCHIVE_NAME=Agente_IA_compressed.zip"

:: Define the project root directory (assuming the script is run from D:\Agente_IA\)
set "PROJECT_ROOT=."

:: Define the 7-Zip executable path.
:: If 7z.exe is in your system's PATH, you can just use "7z".
:: Otherwise, provide the full path, e.g., "C:\Program Files\7-Zip\7z.exe"
set "SEVEN_ZIP_PATH=7z"

echo Compressing project "%PROJECT_ROOT%" to "%ARCHIVE_NAME%"...
echo Excluding:
echo   - agent\.venv\
echo   - cliente\node_modules\
echo   - server\node_modules\

"%SEVEN_ZIP_PATH%" a -tzip "%ARCHIVE_NAME%" "%PROJECT_ROOT%" -x!*.zip -x!agent\.venv\* -x!cliente\node_modules\* -x!server\node_modules\* -mx=9

if %errorlevel% equ 0 (
    echo.
    echo Compression completed successfully!
    echo Archive created: %ARCHIVE_NAME%
) else (
    echo.
    echo An error occurred during compression.
    echo Please ensure 7-Zip is installed and accessible, and the paths are correct.
)

pause
endlocal