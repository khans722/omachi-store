@echo off
chcp 65001 >nul
echo ======================================================
echo    ĐANG ĐẨY CODE OMACHI STORE LÊN GITHUB KHANS722
echo ======================================================
cd /d "D:\OmachiStore_Project"
"C:\Program Files\Git\cmd\git.exe" remote set-url origin https://github.com/khans722/omachi-store.git
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo ======================================================
echo    ĐÃ HOÀN TẤT! BẤM PHÍM BẤT KỲ ĐỂ ĐÓNG
echo ======================================================
pause
