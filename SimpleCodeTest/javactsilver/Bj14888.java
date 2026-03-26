package javactsilver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

public class Bj14888 {
    public static int MAX = -1000000000;
    public static int MIN = 1000000000;
    public static List<Integer> operatorList = new ArrayList<>();
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());
        int arr[] = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for(int i=0;i<n;i++){
            arr[i] = Integer.parseInt(st.nextToken());
        }
        st = new StringTokenizer(br.readLine());
        for(int i=0;i<4;i++){
            int count = Integer.parseInt(st.nextToken());
            for(int j = 0; j<count; j++){
                operatorList.add(i);
            }
        }
        boolean[] visited = new boolean[operatorList.size()];
        permutation(new ArrayList<>(), visited, arr);
        System.out.println(MAX);
        System.out.println(MIN);

    }
    public static void permutation(List<Integer> current, boolean[] visited, int[] arr) {
        if (current.size() == operatorList.size()) {
            calculate(arr, current);
            return;
        }
        for (int i = 0; i < operatorList.size(); i++) {
            if (!visited[i]) {
                visited[i] = true;
                current.add(operatorList.get(i));
                permutation(current, visited, arr);
                current.remove(current.size() - 1);
                visited[i] = false;
            }
        }
    }
    public static void calculate(int[] arr, List<Integer> operator) {
        int result = arr[0];
        for (int i = 0; i < operator.size(); i++) {
            int op = operator.get(i);
            if (op == 0) { // '+'
                result += arr[i + 1];
            } else if (op == 1) { // '-'
                result -= arr[i + 1];
            } else if (op == 2) { // '*'
                result *= arr[i + 1];
            } else if (op == 3) { // '/'
                if (result < 0) {
                    result = -(-result / arr[i + 1]); // 음수 나눗셈 처리
                } else {
                    result /= arr[i + 1];
                }
            }
        }
        MAX = Math.max(MAX, result);
        MIN = Math.min(MIN, result);
    }
}
