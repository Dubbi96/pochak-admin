package softeer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class TreeAttack {
    private static int addList(int[] list){
        int sum = 0;
        for(int i : list){
            sum += i;
        }
        return sum;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        StringTokenizer st = new StringTokenizer(line);
        int N = Integer.parseInt(st.nextToken());
        int M = Integer.parseInt(st.nextToken());
        int[][] map = new int[N][M];
        for(int i = 0; i < N; i++){
            line = br.readLine();
            st = new StringTokenizer(line);
            for(int j = 0; j < M; j++){
                map[i][j] = Integer.parseInt(st.nextToken());
            }
        }
        line = br.readLine();
        st = new StringTokenizer(line);
        int firstAttackStart = Integer.parseInt(st.nextToken());
        int firstAttackEnd = Integer.parseInt(st.nextToken());
        line = br.readLine();
        st = new StringTokenizer(line);
        int secondAttackStart = Integer.parseInt(st.nextToken());
        int secondAttackEnd = Integer.parseInt(st.nextToken());
        int[] sumArr = new int[N];
        for(int i = 0; i < N; i++){
            sumArr[i] = addList(map[i]);
        }
        for(int i = firstAttackStart-1; i <firstAttackEnd; i++){
            if(sumArr[i] > 0){
                sumArr[i] -= 1;
            }
        }
        for(int i = secondAttackStart-1; i <secondAttackEnd; i++){
            if(sumArr[i] > 0){
                sumArr[i] -= 1;
            }
        }
        System.out.println(addList(sumArr));
    }
}
