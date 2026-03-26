package javactsilver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Bj2579 {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int N = Integer.parseInt(br.readLine());
        int arr[] = new int[N];
        int dp[][] = new int[N][2];
        for(int i = 0; i < N; i++){
            arr[i] = Integer.parseInt(br.readLine());
        }

        //초기화(0번, 1번째 수 넣기)
        dp[0][0] = arr[0];
        dp[0][1] = 0;

        if(N==1) {
            System.out.println(dp[0][0]);
            return;
        }

        dp[1][0] = arr[1];
        dp[1][1] = arr[0]+arr[1];
        if(N == 2){
            System.out.println(dp[1][1]);
            return;
        }

        dp[2][0] = dp[0][0] + arr[2];
        dp[2][1] = arr[1]+ arr[2];

        for(int i = 3; i < N; i++){
            dp[i][0] = Math.max(dp[i-2][0],dp[i-2][1]) + arr[i];
            dp[i][1] = Math.max(dp[i-3][0],dp[i-3][1]) + arr[i-1] + arr[i];
        }
        System.out.println(Math.max(dp[N-1][0], dp[N-1][1]));
    }
}
