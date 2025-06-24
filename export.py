#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import argparse

def generate_tree(dir_path: str, exclude: list[str] = None) -> str:
    """
    指定フォルダ以下をツリー形式で文字列化。
    exclude に指定したフォルダ名は再帰的に除外する。
    """
    exclude = set(exclude or [])
    tree_lines: list[str] = []
    base = os.path.abspath(dir_path)
    for root, dirs, files in os.walk(base, topdown=True):
        # 除外フォルダは再帰的にスキップ
        dirs[:] = [d for d in dirs if d not in exclude]
        # 表示用インデント
        level = root.replace(base, '').count(os.sep)
        indent = ' ' * 4 * level
        name = os.path.basename(root) or root
        tree_lines.append(f"{indent}{name}/")
        for f in sorted(files):
            tree_lines.append(f"{indent}    {f}")
    return '\n'.join(tree_lines)

def collect_files(
    dir_path: str,
    exclude: list[str] = None,
    exts: list[str] = None
) -> list[str]:
    """
    指定フォルダ以下を再帰的に探索し、相対パスでリスト化。
    exts に指定した拡張子のみを対象とし、None の場合はすべてのファイルを対象。
    exclude に指定したフォルダ名は再帰的に除外する。
    """
    exclude = set(exclude or [])
    base = os.path.abspath(dir_path)
    files_list: list[str] = []

    # 拡張子フィルタを正規化（先頭にドットがなければ追加）
    if exts:
        norm_exts = tuple(e if e.startswith('.') else f'.{e}' for e in exts)
    else:
        norm_exts = None  # None のときはすべてのファイルを対象

    for root, dirs, files in os.walk(base, topdown=True):
        dirs[:] = [d for d in dirs if d not in exclude]
        for f in files:
            if norm_exts is None or f.lower().endswith(norm_exts):
                full = os.path.join(root, f)
                rel = os.path.relpath(full, base)
                files_list.append(rel)

    return sorted(files_list)

def main():
    parser = argparse.ArgumentParser(
        description="フォルダ構成＋指定拡張子のファイル内容を TXT に出力します"
    )
    parser.add_argument(
        '-d', '--directory',
        default='.',
        help='対象フォルダ（デフォルト: カレントディレクトリ）'
    )
    parser.add_argument(
        '-t', '--tree',
        action='store_true',
        help='先頭にフォルダ構成をツリー表示する'
    )
    parser.add_argument(
        '-e', '--exclude',
        action='append',
        default=[],
        help='再帰的に除外するフォルダ名（複数指定可）'
    )
    parser.add_argument(
        '-x', '--extensions',
        nargs='+',
        default=None,
        help='対象とする拡張子（例: js html py）。省略するとすべてのファイルを対象'
    )
    parser.add_argument(
        '-o', '--output',
        default='output.txt',
        help='出力するテキストファイル名（デフォルト: output.txt）'
    )
    args = parser.parse_args()

    # ツリー文字列を生成（–tree 指定時のみ）
    tree_text = generate_tree(args.directory, args.exclude) if args.tree else ''

    # ファイルを再帰的に収集（拡張子フィルタを適用）
    target_files = collect_files(
        args.directory,
        exclude=args.exclude,
        exts=args.extensions
    )

    # TXT に書き出し
    with open(args.output, 'w', encoding='utf-8') as out:
        if args.tree:
            out.write(tree_text + '\n\n')
        for rel_path in target_files:
            out.write(rel_path + '\n')
            full_path = os.path.join(args.directory, rel_path)
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read().rstrip()
                out.write(content + '\n\n')
            except Exception as e:
                out.write(f"[ファイル読み込みエラー: {e}]\n\n")

    print(f"出力完了: {os.path.abspath(args.output)}")

if __name__ == '__main__':
    main()