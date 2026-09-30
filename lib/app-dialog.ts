export type AppDialogAction = {
  label: string;
  onPress?: () => void | Promise<void>;
  variant?: "primary" | "outline" | "destructive";
};

export type AppDialogOptions = {
  title: string;
  message: string;
  actions?: AppDialogAction[];
};

type DialogPresenter = (
  options: AppDialogOptions,
  resolve?: (value: boolean) => void,
) => void;

let presenter: DialogPresenter | null = null;

export function registerAppDialogPresenter(nextPresenter: DialogPresenter) {
  presenter = nextPresenter;
  return () => {
    if (presenter === nextPresenter) presenter = null;
  };
}

export function showAppDialog(options: AppDialogOptions) {
  presenter?.(options);
}

export function confirmAppDialog(options: AppDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!presenter) {
      resolve(false);
      return;
    }
    presenter(options, resolve);
  });
}
