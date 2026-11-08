#!/bin/bash
# usage: pdfpage.sh DIR CODE...  -> converts DIR/CODE.xlsx to PDF and rasterizes the Phieu_KQ pages (those containing "Công trình:") into DIR/pdf/CODE-pN.png
D=$1; shift
cd "$D"; timeout 280 soffice --headless --convert-to pdf --outdir pdf "$@" >/dev/null 2>&1; cd pdf
for f in "$@"; do b=${f%.xlsx}; n=$(pdfinfo $b.pdf | grep Pages | awk '{print $2}'); for p in $(seq 1 $n); do if pdftotext -f $p -l $p $b.pdf - 2>/dev/null | grep -q "Công trình:"; then pdftoppm -f $p -l $((p+1)) -r 75 -png $b.pdf $b-p$p; echo $b p$p; break; fi; done; done
