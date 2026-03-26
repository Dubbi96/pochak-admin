package softeer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

public class ScaredNamWu {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        StringTokenizer st = new StringTokenizer(line);
        int N = Integer.parseInt(st.nextToken());
        int M = Integer.parseInt(st.nextToken());
        int[] dx = {-1, 1, 0, 0};
        int[] dy = {0, 0, -1, 1};
        Queue<int[]> namuQueue = new LinkedList<>();
        int[][] grid = new int[N][M];
        boolean[][] visited = new boolean[N][M];
        List<int[]> ghosts = new ArrayList<>();
        int[] door = new int[2];
        for (int i = 0; i < N; i++) {
            String row = br.readLine();
            for (int j = 0; j < M; j++) {
                char token = row.charAt(j);
                if (token == '.') {
                    grid[i][j] = 1;
                } else if (token == 'D') {
                    grid[i][j] = 2;
                    door = new int[]{i, j};
                } else if (token == '#') {
                    grid[i][j] = 0;
                } else if (token == 'N') {
                    grid[i][j] = 1;
                    namuQueue.offer(new int[]{i, j, 0});
                    visited[i][j] = true;
                } else if (token == 'G') {
                    grid[i][j] = 1;
                    ghosts.add(new int[]{i, j});
                }
            }
        }
        int minVal = Integer.MAX_VALUE;
        for(int[] ghost : ghosts){
            minVal = Math.min(minVal, Math.abs(ghost[0]-door[0])+Math.abs(ghost[1]-door[1]));
        }
        int namuTime = bfs(grid, dx, dy, door[0], door[1], visited, namuQueue);
        if(namuTime == -1){
            System.out.println("No");
        }
        else if (namuTime < minVal){
            System.out.println("Yes");
        }
        else {
            System.out.println("No");
        }
    }
    static int bfs(int[][] grid, int[] dx, int[] dy, int doorX, int doorY, boolean[][] visited, Queue<int[]> que){
        while(!que.isEmpty()){
            int[] current = que.poll();
            int x = current[0];
            int y = current[1];
            int time = current[2];

            if(current[0] == doorX && current[1] == doorY){
                return time;
            }

            for(int dir = 0; dir < 4; dir++){
                int nx = x+dx[dir];
                int ny = y+dy[dir];
                if(isValid(nx,ny, grid.length, grid[0].length, grid) && !visited[nx][ny]){
                    visited[nx][ny] = true;
                    que.offer(new int[]{nx, ny, time+1});
                }
            }
        }
        return -1;
    }

    static boolean isValid(int x, int y, int N, int M,int[][] grid) {
        return x >= 0 && x < N && y >= 0 && y < M && grid[x][y] != 0;
    }
}
