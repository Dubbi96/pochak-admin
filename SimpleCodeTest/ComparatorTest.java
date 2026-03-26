import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;

public class ComparatorTest {
    public static void main(String[] args) {
        int[][] array = new int[5][2];

        // data가 아래와 같이 이차원 배열로 주어졌다고 가정합니다
        // 만일 오름차순으로 정렬시 이차원 배열 정렬의 기준이 0번째 행렬이면
        // 0, 2, 3, 1, 4 순으로 정렬될 것이고
        // 1번째 행렬이라면
        // 3, 2, 0, 4, 1 순으로 정렬될 것입니다.
        array[0][0] = 10;
        array[0][1] = 200;
        array[1][0] = 30;
        array[1][1] = 300;
        array[2][0] = 15;
        array[2][1] = 150;
        array[3][0] = 25;
        array[3][1] = 100;
        array[4][0] = 50;
        array[4][1] = 250;

        // 1번째 행렬로 정렬하기 위해 Comparator를 이용합니다
        // Override된 compare 함수를 어떻게 정의하냐에 따라서 다양한 정렬이 가능해집니다
        Arrays.sort(array, Comparator.comparingInt(o -> o[1]));

        for (int[] ints : array) {
            System.out.println(ints[0] + " " + ints[1]);
        }
        System.out.println();

        // Node라는 class를 저장한 list를 val기준으로 정렬하는 예제입니다
        ArrayList<Node> list = new ArrayList<Node>();
        list.add(new Node(1, 10));
        list.add(new Node(5, 5));
        list.add(new Node(2, 7));
        list.add(new Node(4, 3));
        list.add(new Node(3, 1));

        // list는 array와 다르게 Collections 함수를 이용하여 정렬합니다
        // 이때도 마찬가지로 Comparator를 사용합니다
        // 이번에는 val기준 내림차순 정렬해보겠습니다
        Collections.sort(list, (o1, o2) -> o2.val - o1.val);
        for (Node node : list) {
            System.out.println(node.idx + " " + node.val);
        }
    }
}

class Node {
    int idx;
    int val;

    public Node(int idx, int val) {
        this.idx = idx;
        this.val = val;
    }
}
