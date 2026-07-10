# NonogramSolver.ts 性能改善 /code-review 指摘事項

`/code-review`（high effort, 8観点×検証）の結果。対象は `agent-docs/nonogram-solver-performance.md` の作業ツリー変更一式（`lineSolver.ts`新規／`NonogramSolver.ts`リファクタ／テスト2件／`tsconfig.json`）。

## 指摘一覧（重大度順）

1. **[correctness] `logicallyDeterminedCount`の二重カウント** — `src/nonogram/NonogramSolver.ts:106`
   バックトラック中の`propagate()`で確定したセルが`restoreNullCells`で元に戻される際、カウンタがデクリメントされない。棄却された分岐の確定数まで累積し、「純粋な論理推論だけで確定したセル数」という本来の意味が壊れる。現状利用者はゼロだが`SolutionResult`の公開フィールド。
   → Task#8

2. **[efficiency] `propagate()`が変化のない行/列まで毎回再計算** — `src/nonogram/NonogramSolver.ts:65`
   バックトラックの全ノードで全行・全列に対し`solveLine`（フルDP構築）をやり直しており、実際に変化した行/列以外は無駄な再検証。20×20低密度盤面で数十秒かかる原因の一つ（セル選択順序の問題とは別軸）。
   → Task#9

3. **[test-coverage] 15×15性能回帰テストのマージンが薄い** — `src/nonogram/NonogramSolver.test.ts:132`
   実測4.7s（ローカルで安定）に対し上限15s、約3倍のマージン。CPU律速のバックトラック探索は分岐的に悪化しうるため、CI環境次第でflakyになる可能性。
   → Task#10

4. **[conventions] `lineSolver.ts`の変数名`i`/`j`が規約違反** — `src/nonogram/lineSolver.ts:10, 25-26`
   `.claude/rules/development.md`: 「変数名は一見して実態が想像できる名前をつける。`u`, `i` などの省略形は原則避けること」に明確に抵触。
   → Task#11

5. **[simplification] `propagate()`内の`normalizeHints`呼び出しが冗長** — `src/nonogram/NonogramSolver.ts:73, 85`
   `solveLine`のDPは`hints=[0]`と`hints=[]`を同一に扱うため（実証済み）、`propagate()`の毎パスでの正規化呼び出しは無駄な作業。`isRowValid`/`isColValid`では引き続き必要。
   → Task#12

6. **[reuse] テストの`toHints()`が`lineToHint()`と重複** — `src/nonogram/NonogramSolver.test.ts:12`
   `NonogramPuzzle.ts`の`lineToHint()`と同一の連長エンコードロジックを再実装。`lineToHint`はモジュール非公開のため、export（またはboolean述語を受け取る一般化）が必要。
   → Task#13

## REFUTEDだった候補（対応不要）

- `tsconfig.json`の`"types": ["vitest/globals"]`が将来`@types/node`のアンビエント型を失う懸念 → `next-env.d.ts`のtriple-slash参照経由で`@types/node`は独立して読み込まれるため実際には無関係と実証済み
- `checkUniqueSolution()`が`this.grid`をリセットしない件 → 同一インスタンスを2回呼んでも`restoreNullCells`により結果が実測で完全に一致することを確認済み（現象として発生しない）

development.mdのVerify/Reviewステップ（`/code-review`）を実施済み。指摘があったため、原則Redからやり直す運用ルールに従う場合は上記タスクへの対応が必要。
