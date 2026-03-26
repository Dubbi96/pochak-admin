package jpg2pdf;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ImageToPdfConverter {

    public static void main(String[] args) {
        String outputPdf = "/Users/gangjong-won/Dubbi/SimpleCodeTest/jpg2pdf/output/output" + LocalDateTime.now() + ".pdf";

        try {
            List<String> imagePaths = getImagePaths("/Users/gangjong-won/Dubbi/SimpleCodeTest/jpg2pdf/images");
            if (imagePaths.isEmpty()) {
                System.out.println("이미지 파일이 없습니다.");
                return;
            }

            convertImagesToPdf(imagePaths, outputPdf);
            System.out.println("PDF 생성 완료: " + outputPdf);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<String> getImagePaths(String directoryPath) {
        File directory = new File(directoryPath);
        List<String> imagePaths = new ArrayList<>();

        if (!directory.exists() || !directory.isDirectory()) {
            System.out.println("유효한 디렉토리가 아닙니다: " + directoryPath);
            return imagePaths;
        }

        File[] imageFiles = directory.listFiles((dir, name) ->
            name.toLowerCase().endsWith(".jpg") ||
            name.toLowerCase().endsWith(".jpeg") ||
            name.toLowerCase().endsWith(".png")
        );

        if (imageFiles == null || imageFiles.length == 0) {
            return imagePaths;
        }

        // 파일 이름 기준으로 정렬
        Arrays.sort(imageFiles, (f1, f2) -> f1.getName().compareToIgnoreCase(f2.getName()));

        // 파일명을 1.jpg, 2.jpg, ... 로 변경
        int index = 1;
        for (File imageFile : imageFiles) {
            String newFileName = index + ".jpg"; // 확장자 일괄 변경 가능
            File newFile = new File(directory, newFileName);
            if (!imageFile.renameTo(newFile)) {
                System.out.println("파일 이름 변경 실패: " + imageFile.getAbsolutePath());
                continue;
            }
            imagePaths.add(newFile.getAbsolutePath());
            index++;
        }

        return imagePaths;
    }

    public static void convertImagesToPdf(List<String> imagePaths, String outputPdf) throws IOException {
        PdfWriter writer = new PdfWriter(outputPdf);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        for (String imagePath : imagePaths) {
            File imgFile = new File(imagePath);
            if (!imgFile.exists()) {
                System.out.println("파일 없음: " + imagePath);
                continue;
            }

            ImageData imageData = ImageDataFactory.create(imagePath);
            Image image = new Image(imageData);

            float imgWidth = image.getImageWidth();
            float imgHeight = image.getImageHeight();
            PageSize pageSize = new PageSize(imgWidth, imgHeight);

            // 새로운 페이지를 이미지 크기에 맞춰 추가
            pdfDocument.addNewPage(pageSize);

            // 이미지 크기 조정 및 페이지 추가
            image.scaleToFit(imgWidth, imgHeight);
            image.setFixedPosition(0, 0);
            document.add(image);
        }

        // 문서 종료 (여러 번 닫히는 문제 해결)
        document.close();
        pdfDocument.close();
    }
}