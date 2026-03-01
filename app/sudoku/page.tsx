import Header from "@/components/ui/Header";
import SudokuBoard from "@/components/sudoku/SudokuBoard";

export default function SudokuPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">数独</h1>
          <p className="text-slate-400 text-sm">
            填入数字，让每行、每列、每个 3×3 宫格都包含 1-9 且不重复
          </p>
        </div>
        <SudokuBoard />
      </main>
    </>
  );
}
