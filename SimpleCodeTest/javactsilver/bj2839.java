package javactsilver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class bj2839 {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int N = Integer.parseInt(br.readLine());
        int count = 0;
        while (N >= 0) {
            if (N % 5 == 0) {
                count += N / 5;
                System.out.println(count);
                return;
            }
            N -= 3;
            count++;
        }
        System.out.println(-1);
    }
}

        /*int countFifteen = N/15;
        int countFifteenLeft = N%15;
        if(countFifteenLeft == 3 || countFifteenLeft == 5){
            System.out.println(countFifteen*3 + 1);
            return;
        }
        if(countFifteenLeft == 6 || countFifteenLeft == 8 || countFifteenLeft == 10){
            System.out.println(countFifteen*3 + 2);
            return;
        }
        if(countFifteenLeft == 9 || countFifteenLeft == 11 || countFifteenLeft ==13){
            System.out.println(countFifteen*3 + 3);
            return;
        }
        if(countFifteenLeft == 12){
            System.out.println(countFifteen*3 + 4);
            return;
        }
        System.out.println(-1);
    }
}*/