package javactsilver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class bj1058 {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int N = Integer.parseInt(br.readLine());
        String[][] grid = new String[N][N];
        for (int i = 0; i < N; i++) {
            String line = br.readLine();
            for (int j = 0; j < N; j++) {
                grid[i][j] = String.valueOf(line.charAt(j));
            }
        }
        int maxCount = 0;
        for (int i = 0; i < N; i++) {
            int count = countSecondFriends(grid, N, i);
            maxCount = Math.max(maxCount, count);
        }
        System.out.println(maxCount);
    }

    public static int countSecondFriends(String[][] grid, int N, int person) {
        boolean[] visited = new boolean[N];
        visited[person] = true;
        for (int i = 0; i < N; i++) {
            if (grid[person][i].equals("Y")) {
                visited[i] = true;
                for (int j = 0; j < N; j++) {
                    if (grid[i][j].equals("Y")) {
                        visited[j] = true;
                    }
                }
            }
        }
        int count = 0;
        for (boolean v : visited) {
            if (v) count++;
        }
        return count - 1;
    }
}