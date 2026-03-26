package softeer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.StringTokenizer;

public class HyodoTogether {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        int[][] grid = new int[n][n];
        boolean[][] visited = new boolean[n][n];
        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(br.readLine());
            for (int j =0 ; j<n;j++){
                grid[i][j] = Integer.parseInt(st.nextToken());
            }
        }
        int[][] friends = new int[4][m];
        for(int i = 0; i<m; i++){
            st = new StringTokenizer(br.readLine());
            for(int j = 0; j<2; j++){
                friends[j][i] = Integer.parseInt(st.nextToken());
            }
            friends[2][i] = grid[friends[0][i]][friends[1][i]];
            friends[3][i] = 0;
        }
        int[] dx = {0,0,1,-1};
        int[] dy = {1,-1,0,0};
        int maximum = 0;
        for(int i = 0 ; i < friends.length ;i++){
            dfs(visited,friends,i,grid,dx,dy,friends[0][i],friends[1][i]);
            maximum += friends[2][i];
        }
        System.out.println(maximum);
    }
    public static void dfs(boolean[][] visited, int[][] friends, int friendsNumb, int[][] grid, int[] dx, int[] dy,int x, int y) {
        if (friends[3][friendsNumb] == 3) {
            return;
        }/*
        int x= friends[0][friendsNumb];
        int y = friends[1][friendsNumb];*/
        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i];
            int ny = y + dy[i];
            if (nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[0].length && !visited[nx][ny]) {
                visited[nx][ny] = true;
                friends[3][friendsNumb] += 1;
                friends[2][friendsNumb] += grid[nx][ny];
                dfs(visited, friends, friendsNumb, grid, dx, dy, nx, ny);
                visited[nx][ny] = false;
            }
        }
    }

    public static void permutation(List<int[]> current, boolean[] visited, int[][] arr) {
        if (current.size() == arr.length) {
            return;
        }
        for (int i = 0; i < arr.length; i++) {
            if (!visited[i]) {
                visited[i] = true;
                current.add(arr[i]);
                permutation(current, visited, arr);
                current.remove(current.size() - 1);
                visited[i] = false;
            }
        }
    }
}
