package javactsilver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.StringTokenizer;

public class Bj6236 {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int N = Integer.parseInt(st.nextToken());
        int M = Integer.parseInt(st.nextToken());
        int[] arr = new int[N];
        int[] diffOdd = new int[(N-1)/2 + 1];
        int[] diffEven = new int[(N-1) - (N-1)/2 + 1];
        int K;
        for(int i=0;i<N ; i++){
            arr[i] = Integer.parseInt(br.readLine());
        }
        int oddIndex = 0;
        int evenIndex = 0;
        for (int i = 0; i < N - 1; i++) {
            if (i % 2 == 0) {
                diffOdd[oddIndex++] = arr[i] + arr[i + 1];
            } else {
                diffEven[evenIndex++] = arr[i] + arr[i + 1];
            }
        }
        Arrays.sort(diffOdd);
        Arrays.sort(diffEven);
        Arrays.sort(arr);
        int index = Math.max(0, N-M-1);
        K = Math.min(diffOdd[index],diffEven[index]);
        if(N-M ==0){
            System.out.println(arr[N-1]);
            return;
        }
        if(arr[arr.length-1] > K){
            System.out.println(-1);
            return;
        }
        System.out.println(K);
    }
}
//못품
