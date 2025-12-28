#!/usr/bin/env python3
"""
PDFから画像を抽出するスクリプト
"""

import pypdfium2 as pdfium
from pathlib import Path

def extract_pdf_pages(pdf_path, output_dir, prefix, scale=2.0):
    """
    PDFの各ページを画像として保存
    
    Args:
        pdf_path: PDFファイルのパス
        output_dir: 出力ディレクトリ
        prefix: ファイル名のプレフィックス
        scale: 解像度スケール（2.0 = 144dpi相当）
    """
    pdf = pdfium.PdfDocument(pdf_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Processing: {pdf_path}")
    print(f"Pages: {len(pdf)}")
    
    for i, page in enumerate(pdf):
        # ページを画像としてレンダリング
        bitmap = page.render(scale=scale)
        pil_image = bitmap.to_pil()
        
        # ファイル名を生成
        output_path = output_dir / f"{prefix}_page{i+1}.png"
        pil_image.save(output_path)
        print(f"  Saved: {output_path}")
    
    page_count = len(pdf)
    pdf.close()
    return page_count

if __name__ == "__main__":
    base_dir = Path("/Users/konakayouhei/Documents/香川")
    output_dir = base_dir / "voice-navigator" / "images"
    
    # PDFファイルを処理
    pdf_files = [
        ("香川ヒアリング.pdf", "hearing"),
        ("送状(新規申請).pdf", "shinki"),
        ("送状(変更申請).pdf", "henkou"),
    ]
    
    for pdf_name, prefix in pdf_files:
        pdf_path = base_dir / pdf_name
        if pdf_path.exists():
            extract_pdf_pages(pdf_path, output_dir, prefix)
        else:
            print(f"Not found: {pdf_path}")
    
    print("\nDone!")
