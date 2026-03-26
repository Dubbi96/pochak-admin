package softeer;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class HyodoFood {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // 입력 처리
        int N = Integer.parseInt(br.readLine());
        int[] foods = new int[N];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < N; i++) {
            foods[i] = Integer.parseInt(st.nextToken());
        }

        // 왼쪽에서 오른쪽으로 최대 부분합 계산
        int[] leftMax = new int[N];
        int currentSum = foods[0];
        leftMax[0] = currentSum;
        for (int i = 1; i < N; i++) {
            currentSum = Math.max(foods[i], currentSum + foods[i]);
            leftMax[i] = Math.max(leftMax[i - 1], currentSum);
        }

        // 오른쪽에서 왼쪽으로 최대 부분합 계산
        int[] rightMax = new int[N];
        currentSum = foods[N - 1];
        rightMax[N - 1] = currentSum;
        for (int i = N - 2; i >= 0; i--) {
            currentSum = Math.max(foods[i], currentSum + foods[i]);
            rightMax[i] = Math.max(rightMax[i + 1], currentSum);
        }

        // 인접하지 않은 두 구간의 최대 합 계산
        int maxSatisfaction = Integer.MIN_VALUE;
        if(N == 3){
            System.out.println(foods[0]+foods[2]);
        }else {
            for (int i = 0; i < N - 1; i++) {
                maxSatisfaction = Math.max(maxSatisfaction, leftMax[i] + rightMax[i + 1]);
            }
            System.out.println(maxSatisfaction);
        }
    }
}
/*
package softeer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.StringTokenizer;

public class HyodoFood {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int N = Integer.parseInt(br.readLine());
        int[] foods= new int[N];
        int[] fMax = new int[N];
        int[] rMax = new int[N];
        int totMax = Integer.MIN_VALUE;
        StringTokenizer st = new StringTokenizer(br.readLine());
        for(int i = 0; i < N; i++) {
            foods[i] = Integer.parseInt(st.nextToken());
        }
        int fMaxVal = 0;
        for(int i = 0; i < N; i++){
            fMaxVal += foods[i];
            fMax[i] = fMaxVal;
        }
        int rMaxVal = 0;
        for(int i = N-1; i >= 0; i--){
            rMaxVal += foods[i];
            rMax[i] = rMaxVal;
        }
        System.out.println(Arrays.toString(fMax));
        System.out.println(Arrays.toString(rMax));
        for(int i = 1; i < N-1 ; i++) {
            System.out.println("findMax(fMax, rMax, i) = " + findMax(fMax, rMax, i));
            totMax = Math.max(totMax,findMax(fMax, rMax, i));
        }
        System.out.println(totMax);
    }
    private static int findMax(int[] fmax, int[] rmax, int i) {
        int totfMax = Integer.MIN_VALUE;
        int totrMax = Integer.MIN_VALUE;
        int totfMin = Integer.MAX_VALUE;
        int totrMin = Integer.MAX_VALUE;
        int fmaxi = -1;
        int rmaxi = -1;
        for(int j = 0; j < i; j++){
            if(totfMax < fmax[j]) fmaxi = j;
            totfMax = Math.max(totfMax, fmax[j]);
        }
        for(int j = i+1; j < rmax.length; j++) {
            if (totrMax < rmax[j]) rmaxi = j;
            totrMax = Math.max(totrMax, rmax[i]);
        }
        System.out.println("rmaxi = " + rmaxi);
        System.out.println("fmaxi = " + fmaxi);
        for(int j = 0; j <fmaxi ; j++){
            totfMin = Math.min(totfMin, fmax[j]);
        }
        for(int j = rmaxi + 1; j < rmax.length ; j++){
            totrMin = Math.min(totrMin, rmax[i]);
        }

        return totfMax-totfMin + totrMax-totrMin;
    }
}
*/
