package com.pochak.commerce.product.service;

import com.pochak.commerce.product.dto.CreateProductRequest;
import com.pochak.commerce.product.dto.ProductResponse;
import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> getProducts(ProductType productType, Boolean isActive, Pageable pageable) {
        return productRepository.findWithFilters(productType, isActive, pageable)
                .map(ProductResponse::from);
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse getProduct(Long id) {
        Product product = findProductById(id);
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .productType(request.getProductType())
                .priceKrw(request.getPriceKrw())
                .pricePoint(request.getPricePoint())
                .durationDays(request.getDurationDays())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .build();

        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, CreateProductRequest request) {
        Product product = findProductById(id);
        product.update(
                request.getName(),
                request.getProductType(),
                request.getPriceKrw(),
                request.getPricePoint(),
                request.getDurationDays(),
                request.getReferenceType(),
                request.getReferenceId()
        );
        return ProductResponse.from(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProductById(id);
        product.softDelete();
    }

    public Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }
}
