package javactsilver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class bj1012 {
    public static int[] dx = {0, 0, -1, 1};
    public static int[] dy = {1, -1, 0, 0};
    static int[][] field;
    static boolean[][] visited;
    static int M,N,K;
    public static void dfs(int x, int y){
        visited[x][y] = true;
        for(int i=0; i<4; i++) {
            int nx = x + dx[i];
            int ny = y + dy[i];
            if(nx >= 0 && nx <M && ny >= 0 && ny < N && field[nx][ny] == 1 && !visited[nx][ny]){
                dfs(nx, ny);
            }
        }
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int T = Integer.parseInt(br.readLine());
        for(int t=0; t<T; t++){
            StringTokenizer st = new StringTokenizer(br.readLine());
            M = Integer.parseInt(st.nextToken());
            N = Integer.parseInt(st.nextToken());
            K = Integer.parseInt(st.nextToken());
            field = new int[M][N];
            visited = new boolean[M][N];
            for(int i=0;i<K;i++){
                StringTokenizer st1 = new StringTokenizer(br.readLine());
                int x = Integer.parseInt(st1.nextToken());
                int y = Integer.parseInt(st1.nextToken());
                field[x][y] = 1;
            }
            int wormCount = 0;
            for(int i=0;i<M;i++){
                for(int j=0;j<N;j++){
                    if(field[i][j] == 1 && !visited[i][j]){
                        dfs(i, j);
                        wormCount++;
                    }
                }
            }
            System.out.println(wormCount);
        }
    }
}
