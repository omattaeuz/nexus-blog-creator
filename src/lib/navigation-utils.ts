export class NavigationUtils {
  static goToPosts(): void {
    window.location.href = '/posts';
  }

  static goToHome(): void {
    window.location.href = '/';
  }

  static goToCreatePost(): void {
    window.location.href = '/posts/new';
  }

  static goToDashboard(): void {
    window.location.href = '/dashboard';
  }

  static goToLogin(): void {
    window.location.href = '/login';
  }

  static goToRegister(): void {
    window.location.href = '/register';
  }

  static goToPost(postId: string): void {
    window.location.href = `/posts/${postId}`;
  }

  static goToEditPost(postId: string): void {
    window.location.href = `/posts/${postId}/edit`;
  }
}