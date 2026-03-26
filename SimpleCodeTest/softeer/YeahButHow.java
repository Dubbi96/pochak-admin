package softeer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class YeahButHow {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuffer sb = new StringBuffer();
        String func = br.readLine();
        char[] charFunc = func.toCharArray();
        int leftBracketCount = 0;
        int rightBracketCount = 0;
        for(int i = 0; i < charFunc.length; i++){
            if(leftBracketCount - rightBracketCount < 0){
                System.out.println("NO");
            }
            if(charFunc[i] == '('){
                leftBracketCount++;
                sb.append(charFunc[i]);
                sb.append("1+");
            }
            else if(charFunc[i] == ')' && i != charFunc.length - 1){
                rightBracketCount++;
                sb.deleteCharAt(sb.length()-1);
                sb.append(charFunc[i]);
                sb.append("+");
            }
            else{
                sb.deleteCharAt(sb.length()-1);
                sb.append(charFunc[i]);
            }
            //'(' 나오면 1+ 추가
            //')' 가 나왔으면, 앞에 + 지우고 뒤에 + 추가
            //만약 마지막 ')'라면 뒤 + 까지 지움
        }
        System.out.println(sb);
    }
}
