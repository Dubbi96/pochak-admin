package softeer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class XMarksTheSpot {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        StringTokenizer st;
        int N = Integer.parseInt(line);
        String[][] map = new String[N][2];
        for(int i = 0; i < N; i++) {
            st = new StringTokenizer(br.readLine());
            map[i][0] = st.nextToken();
            map[i][1] = st.nextToken();
        }
        StringBuffer sb = new StringBuffer();
        for(int i = 0; i < N; i++) {
            char[] charList1 = map[i][0].toCharArray();
            char[] charList2 = map[i][1].toCharArray();
            for(int j = 0; j<charList1.length; j++) {
                if(charList1[j] == 'x' || charList1[j] == 'X'){
                    sb.append(Character.toUpperCase(charList2[j]));
                }
            }
        }
        System.out.println(sb);
    }
}
